// hooks/useFileUpload.js
import { useState } from 'react';

export const useFileUpload = (supabase) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async (file, roomId, userId) => {
    if (!file || !supabase) {
      throw new Error('File or Supabase client missing');
    }

    setUploading(true);
    setError(null);

    try {
      console.log('📤 Starting file upload...');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        roomId,
        userId
      });

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}/${userId}/${Date.now()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      console.log('Uploading to path:', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Supabase upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', publicUrl);

      return {
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      };

    } catch (err) {
      console.error('💥 File upload error:', err);
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, error };
};