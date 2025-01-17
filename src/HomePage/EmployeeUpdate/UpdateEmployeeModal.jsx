import { useState, useEffect,useCallback } from 'react';
import PersonalInfoModal from './PersonalInfoModal';
import ProfessionalInfoModal from './ProfessionalInfoModal';
import { getEmployeeDetails, updateEmployeeDetails } from './employeeService';
import Loader from '../../Assets/Loader';
 
export default function UpdateEmployeeModal({ isOpen, onClose, employeeId }) {
  const [step, setStep] = useState(1);
  const [employeeData, setEmployeeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const fetchEmployeeDetails = useCallback(async () => {
    if (!employeeId) {
      setError('Employee ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeDetails(employeeId);
      setEmployeeData(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error fetching employee details';
      setError(errorMessage);
      console.error('Error fetching employee details:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]); // useCallback will memoize the function based on employeeId

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployeeDetails();
    }
  }, [isOpen, employeeId, fetchEmployeeDetails]); 
 
  const handleDataChange = (newData) => {
    setEmployeeData(newData);
    console.log(employeeData);
  };
 
  const handleNext = (data) => {
    setStep(2);
    
  };
 
  const handleBack = () => {
    setStep(1);
  };
 
  const handleSubmit = async (formData) => {
    if (!employeeId) {
      console.error('Employee ID is required for update');
      return;
    }
 
    try {
      setLoading(true);
      await updateEmployeeDetails(employeeId, { ...employeeData, ...formData });
      setLoading(false);
      setStep(1);
      onClose();
      // You might want to add a success notification here
    } catch (error) {
      console.error('Error updating employee:', error);
      setLoading(false);
      // You might want to add an error notification here
    }
  };
 
  if (!isOpen) return null;
 
  if (loading) {
    return (
<Loader/>
    );
  }
 
  if (error) {
    return (
<div className="fixed inset-0 flex items-center justify-center bg-black/30">
<div className="bg-white p-6 rounded-lg">
<p className="text-red-500">{error}</p>
<button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
>
            Close
</button>
</div>
</div>
    );
  }
 
  return (
<>
<PersonalInfoModal
        isOpen={isOpen && step === 1}
        onClose={onClose}
        onNext={handleNext}
        initialData={employeeData}
        onDataChange={handleDataChange}
      />
{step===2 &&
    <ProfessionalInfoModal
    isOpen={isOpen && step === 2}
    onClose={onClose}
    onBack={handleBack}
    onSubmit={handleSubmit}
    initialData={employeeData}
    onDataChange={handleDataChange}
  />
}
</>
  );
}