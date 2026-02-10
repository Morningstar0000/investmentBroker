import { supabase } from '../client'

export const updateUserMetrics = async (userId) => {
  try {
    console.log(`🚀 updateUserMetrics STARTED for user: ${userId}`)
    
    // STEP 1: FIRST get wallet transfers to calculate STARTING BALANCE
    console.log(`💰 Step 1: Fetching wallet transfers for starting balance`)
    const { data: walletTransfers } = await supabase
      .from("wallet_transfers")
      .select("amount, transfer_type, status")
      .eq("user_id", userId)
      .eq("status", "completed")

    // Calculate starting balance from wallet transfers
    const totalDeposits = walletTransfers
      ?.filter(t => t.transfer_type === "wallet_to_trading" || t.transfer_type === "deposit")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0

    const totalWithdrawals = walletTransfers
      ?.filter(t => t.transfer_type === "trading_to_wallet" || t.transfer_type === "withdrawal")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0

    const startingBalance = totalDeposits - totalWithdrawals

    console.log(`💵 Starting balance from wallet transfers: $${startingBalance}`, {
      totalDeposits,
      totalWithdrawals
    })

    // STEP 2: Fetch positions
    console.log(`📊 Step 2: Fetching positions`)
    const [openRes, closedRes] = await Promise.all([
      supabase.from("open_positions").select("*").eq("user_id", userId),
      supabase.from("closed_positions").select("*").eq("user_id", userId)
    ]);

    if (openRes.error) throw openRes.error
    if (closedRes.error) throw closedRes.error

    const openPositions = openRes.data || []
    const closedPositions = closedRes.data || []

    console.log(`✅ Found ${openPositions.length} open, ${closedPositions.length} closed positions`)

    // STEP 3: Calculate total P&L from closed positions
    const totalClosedPnl = closedPositions.reduce((sum, pos) => {
      return sum + (parseFloat(pos.pnl) || 0)
    }, 0)

    console.log(`💵 Total P&L from closed positions = $${totalClosedPnl}`)

    // STEP 4: CRITICAL FIX: Account Balance = Starting Balance + Total Closed P&L
    const accountBalance = startingBalance + totalClosedPnl
    console.log(`💰 Account Balance = $${startingBalance} (starting) + $${totalClosedPnl} (closed P&L) = $${accountBalance}`)

    // STEP 5: Calculate total open P&L
    const totalOpenPnl = openPositions.reduce((sum, pos) => sum + (parseFloat(pos.pnl) || 0), 0)
    console.log(`📈 Total Open P&L = $${totalOpenPnl}`)

    // STEP 6: Calculate equity: Account Balance + Total Open P&L
    const equity = accountBalance + totalOpenPnl
    console.log(`🧮 Equity = $${accountBalance} + $${totalOpenPnl} = $${equity}`)

    // STEP 7: Count open positions
    const openPositionsCount = openPositions.length
    console.log(`🔢 Open positions count = ${openPositionsCount}`)

    // STEP 8: Get existing metrics for win_rate
    console.log(`📊 Getting existing user_metrics`)
    
    const { data: existingMetrics } = await supabase
      .from("user_metrics")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    // Calculate win rate
     const winRate = existingMetrics?.win_rate || 0
    console.log(`🎯 Using existing win_rate (preserved): ${winRate}%`)
    
    // Calculate today's P&L percentage
    const today = new Date().toISOString().split('T')[0]
    const todayClosedPnL = closedPositions
      .filter(pos => {
        if (!pos.close_time) return false
        const closeDate = pos.close_time.split('T')[0]
        return closeDate === today
      })
      .reduce((sum, pos) => sum + (pos.pnl || 0), 0)

    const todayPnlPercent = accountBalance > 0 
      ? parseFloat(((todayClosedPnL / accountBalance) * 100).toFixed(2))
      : 0

    console.log(`📈 Today's P&L: $${todayClosedPnL} (${todayPnlPercent}% of balance)`)

    // STEP 9: Prepare update data - INCLUDE ALL REQUIRED FIELDS
    const updateData = {
      user_id: userId,
      account_balance: accountBalance,
      total_open_pnl: totalOpenPnl,
      equity: equity,
      starting_balance: startingBalance,
      today_pnl_percent: todayPnlPercent,
      win_rate: winRate,
      open_positions: openPositionsCount,
      // updated_at: new Date().toISOString(),
      // Include these if your database requires them (check your schema)
      // today_pnl: todayClosedPnL || 0
    }

    console.log(`📤 Upserting user_metrics with:`, updateData)

    // STEP 10: UPSERT user_metrics
    const { error: updateError } = await supabase
      .from("user_metrics")
      .upsert(updateData, {
        onConflict: 'user_id'
      })

    if (updateError) {
      console.error(`❌ ERROR updating user_metrics:`, updateError)
      throw updateError
    }

    console.log(`✅ SUCCESS! Updated user_metrics for user ${userId}`)
    console.log(`   Starting Balance: $${startingBalance}`)
    console.log(`   Account Balance: $${accountBalance}`)
    console.log(`   Total Open P&L: $${totalOpenPnl}`)
    console.log(`   Equity: $${equity}`)
    console.log(`   Open Positions: ${openPositionsCount}`)
    console.log(`   Win Rate: ${winRate}%`)
    console.log(`   Today's P&L %: ${todayPnlPercent}%`)
    
    return {
      success: true,
      metrics: updateData
    }
  } catch (error) {
    console.error(`❌ FATAL ERROR in updateUserMetrics:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}