"use client";

import React, { useState } from 'react';
import InvestorForm from './AdminInvestorsform';
import { ArrowLeft } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { supabase } from '../client';
import { useToast } from '../context/ToastContext';

export default function CreateInvestorPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Prepare the data
      const investorData = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('investors')
        .insert([investorData])
        .select()
        .single();

      if (error) throw error;

      addToast(`Investor "${formData.name}" created successfully!`, 'success');
      
      // Redirect to investor management page after a short delay
      setTimeout(() => {
        router.push('/admin/investors');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating investor:', error);
      addToast(`Error creating investor: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          onClick={() => router.push('/admin/investors')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Investors
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900">Add New Investor</h1>
        <p className="text-gray-600">Fill in the details below to create a new investor profile</p>
      </div>

      <InvestorForm 
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}