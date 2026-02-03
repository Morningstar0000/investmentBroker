"use client";

import React, { useState, useEffect } from 'react';
import InvestorForm from './AdminInvestorsform';
import { ArrowLeft, Loader } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { supabase } from '../client';
import { useToast } from '../context/ToastContext';

export default function EditInvestorPage({investorId}) {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
   if (investorId) {
      fetchInvestor(investorId);
    }
  }, [investorId]);

  const fetchInvestor = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setInvestor(data);
    } catch (error) {
      addToast(`Error loading investor: ${error.message}`, 'error');
      router.push('/admin/investors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      
      const updatedData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('investors')
        .update(updatedData)
        .eq('id', params.id);

      if (error) throw error;

      addToast(`Investor "${formData.name}" updated successfully!`, 'success');
      
      // Redirect back after a short delay
      setTimeout(() => {
        router.push('/admin/investors');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating investor:', error);
      addToast(`Error updating investor: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Loading investor data...</p>
        </div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Investor not found</p>
        <Button
          onClick={() => router.push('/admin/investors')}
          className="mt-4"
        >
          Back to Investors
        </Button>
      </div>
    );
  }

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
        
        <div className="flex items-center gap-4">
          <img
            src={investor.avatar_url || '/placeholder-avatar.jpg'}
            alt={investor.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Investor</h1>
            <p className="text-gray-600">Editing: {investor.name} (@{investor.username})</p>
          </div>
        </div>
      </div>

      <InvestorForm 
        initialData={investor}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}