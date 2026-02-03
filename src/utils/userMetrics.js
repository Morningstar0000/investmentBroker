import { supabase } from '../client'

export const updateUserMetrics = async (userId) => {
  try {
    console.log(`🚀🚀🚀 updateUserMetrics STARTED for user: ${userId}`)
    
    // 1. Fetch user's open positions
    console.log(`📊 Step 1: Fetching positions for user ${userId}`)
    const [openRes, closedRes] = await Promise.all([
      supabase.from("open_positions").select("*").eq("user_id", userId),
      supabase.from("closed_positions").select("*").eq("user_id", userId)
    ]);

    if (openRes.error) throw openRes.error
    if (closedRes.error) throw closedRes.error

    const openPositions = openRes.data || []
    const closedPositions = closedRes.data || []

    console.log(`✅ Found ${openPositions.length} open positions, ${closedPositions.length} closed positions`)

    // 2. Calculate account_balance from ALL closed positions P&L
    const accountBalance = closedPositions.reduce((sum, pos) => {
      return sum + (pos.pnl || 0)
    }, 0)

    console.log(`💵 Calculated account_balance from ${closedPositions.length} closed positions = $${accountBalance}`)

    // 3. Calculate total open P&L
    const totalOpenPnl = openPositions.reduce((sum, pos) => sum + (pos.pnl || 0), 0)
    console.log(`💰 Calculated total_open_pnl = $${totalOpenPnl}`)

    // 4. Calculate equity: account_balance + total_open_pnl
    const equity = accountBalance + totalOpenPnl
    console.log(`🧮 New equity = $${accountBalance} + $${totalOpenPnl} = $${equity}`)

    // 5. Count open positions
    const openPositionsCount = openPositions.length
    console.log(`🔢 Open positions count = ${openPositionsCount}`)

    // 6. Get existing win_rate from database (for manual control)
    console.log(`📊 Getting existing user_metrics for user ${userId}`)
    
    const { data: existingMetrics } = await supabase
      .from("user_metrics")
      .select("win_rate, today_pnl_percent, max_drawdown, profit_factor, total_trades")
      .eq("user_id", userId)
      .maybeSingle()

    const winRate = existingMetrics?.win_rate || 0
    const existingTodayPnlPercent = existingMetrics?.today_pnl_percent || 0
    
    console.log(`🎯 Using existing win_rate: ${winRate}%`)

    // 7. Calculate today's P&L percentage
    const today = new Date().toISOString().split('T')[0]
    const todayClosedPnL = closedPositions
      .filter(pos => {
        if (!pos.close_time) return false
        const closeDate = pos.close_time.split('T')[0]
        return closeDate === today
      })
      .reduce((sum, pos) => sum + (pos.pnl || 0), 0)

    // Use existing today_pnl_percent or calculate new one
    const todayPnlPercent = accountBalance > 0 
      ? parseFloat(((todayClosedPnL / accountBalance) * 100).toFixed(2))
      : existingTodayPnlPercent

    console.log(`📈 Today's P&L: $${todayClosedPnL} (${todayPnlPercent}% of balance)`)

    // 8. Prepare update data - preserve existing win_rate
    const updateData = {
      user_id: userId,
      account_balance: accountBalance,
      total_open_pnl: totalOpenPnl,
      equity: equity,
      today_pnl_percent: todayPnlPercent,
      win_rate: winRate, // Keep existing win_rate
      open_positions: openPositionsCount,
      // Preserve other existing fields
      ...(existingMetrics?.max_drawdown !== undefined && { max_drawdown: existingMetrics.max_drawdown }),
      ...(existingMetrics?.profit_factor !== undefined && { profit_factor: existingMetrics.profit_factor }),
      ...(existingMetrics?.total_trades !== undefined && { total_trades: existingMetrics.total_trades }),
    }

    console.log(`📤 Upserting user_metrics with:`, updateData)

    // 9. UPSERT user_metrics
    const { error: updateError } = await supabase
      .from("user_metrics")
      .upsert(updateData, {
        onConflict: 'user_id'
      })

    if (updateError) {
      console.error(`❌❌❌ ERROR updating user_metrics:`, updateError)
      throw updateError
    }

    console.log(`✅✅✅ SUCCESS! Updated user_metrics for user ${userId}`)
    console.log(`   Account Balance: $${accountBalance}`)
    console.log(`   Total Open P&L: $${totalOpenPnl}`)
    console.log(`   Equity: $${equity}`)
    console.log(`   Open Positions: ${openPositionsCount}`)
    console.log(`   Win Rate (preserved): ${winRate}%`)
    
    return {
      success: true,
      metrics: updateData
    }
  } catch (error) {
    console.error(`❌❌❌ FATAL ERROR in updateUserMetrics:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}