import React, { useState } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ onUploadSuccess, currentImageUrl }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    // TODO: We will replace these variables with your exact account credentials next!
    const CLOUD_NAME = "dl4b62svx"; 
    const UPLOAD_PRESET = "Novel_Dive"; 

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        onUploadSuccess(data.secure_url);
      } else {
        console.error("Cloudinary Engine Rejection:", data);
      }
    } catch (err) {
      console.error("Network streaming upload failure:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
        Cover Thumbnail
      </label>
      
      <div className="relative border border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[140px] cursor-pointer group">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          disabled={loading}
        />
        
        {loading ? (
          <div className="flex flex-col items-center space-y-2 text-purple-600 animate-pulse">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Uploading Asset...</span>
          </div>
        ) : currentImageUrl ? (
          <div className="relative w-full h-32 rounded-xl overflow-hidden">
            <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
              Replace Image
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 text-gray-400 group-hover:text-black transition-colors">
            <UploadCloud size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Upload Cover Variant</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;