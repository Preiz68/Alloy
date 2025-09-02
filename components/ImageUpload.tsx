'use client';

import { ChangeEvent, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { FaUpload } from 'react-icons/fa';

type Props = {
  name: string;
};

export const ImageUpload = ({ name }: Props) => {
  const [uploading, setUploading] = useState(false);
  const { setValue, watch } = useFormContext();
  const imageUrl = watch(name);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `avatars/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setValue(name, url);
    setUploading(false);
  };

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-gray-700">Upload Photo</label>
      <input type="file" onChange={handleUpload} accept="image/*" className="mt-2" />
      {uploading ? (
        <p className="text-sm text-blue-500 mt-1">Uploading...</p>
      ) : imageUrl ? (
        <motion.img
          key={imageUrl}
          src={imageUrl}
          alt="Uploaded"
          className="mt-3 w-32 h-32 object-cover rounded-lg border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        />
      ) : null}
    </div>
  );
};

export default ImageUpload;
