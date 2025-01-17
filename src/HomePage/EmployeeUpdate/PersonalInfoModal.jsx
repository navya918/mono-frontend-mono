import { useState } from 'react';
import { Dialog } from '@headlessui/react';
 
export default function PersonalInfoModal({ 
  isOpen, 
  onClose, 
  onNext, 
  initialData,
  onDataChange 
}) {
  const [formData, setFormData] = useState(initialData);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onDataChange(updatedData);
  };
 
  return (
<Dialog open={isOpen} onClose={onClose} className="relative z-50">
<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
<div className="fixed inset-0 flex items-center justify-center p-4">
<Dialog.Panel className="mx-auto max-w-2xl rounded-lg bg-white p-6 w-full">
<Dialog.Title className="text-xl font-semibold mb-6">Personal Information</Dialog.Title>
<div className="space-y-6">
<p className="text-sm text-gray-500">
              NOTE: You can't change the Email once the form is filled
</p>
 
            <div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-sm font-medium text-gray-700">First name</label>
<input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
</div>
<div>
<label className="block text-sm font-medium text-gray-700">Last name</label>
<input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
</div>
</div>
 
            <div>
<label className="block text-sm font-medium text-gray-700">Email address</label>
<input
                type="email"
                name="email"
                value={formData.email || ''}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
              />
</div>
 
            <div>
<label className="block text-sm font-medium text-gray-700">Country</label>
<select
                name="country"
                value={formData.country || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
>
<option value="">Select a country</option>
<option value="US">United States</option>
<option value="UK">United Kingdom</option>
<option value="CA">Canada</option>
</select>
</div>
 
            <div>
<label className="block text-sm font-medium text-gray-700">Street address</label>
<input
                type="text"
                name="streetAddress"
                value={formData.streetAddress || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
</div>
 
            <div className="grid grid-cols-3 gap-4">
<div>
<label className="block text-sm font-medium text-gray-700">City</label>
<input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
</div>
<div>
<label className="block text-sm font-medium text-gray-700">State / Province</label>
<input
                  type="text"
                  name="region"
                  value={formData.region || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
</div>
<div>
<label className="block text-sm font-medium text-gray-700">ZIP / Postal code</label>
<input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
</div>
</div>
</div>
 
          <div className="mt-6 flex justify-end gap-3">
<button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
>
              Cancel
</button>
<button
              type="button"
              onClick={()=>onNext(formData)}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
>
              Next
</button>
</div>
</Dialog.Panel>
</div>
</Dialog>
  );
}