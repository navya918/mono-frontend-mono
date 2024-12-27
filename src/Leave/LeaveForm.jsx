import React, {useEffect, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';
 
 
function LeaveRequestForm(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', employeeId: '', email: '', managerId: '', managerEmail: '', phone: '',
        managerName: 'Raja', leaveRequestFor: 'Days', leaveType: '', leaveStartDate: '',
        leaveEndDate: '', duration: '', comments: '', medicalDocument: null
    });
    const [selectedFile, setSelectedFile] = useState(null); // New state for file upload
    const [errors, setErrors] = useState(false);
    const [isCommentsEnabled, setIsCommentsEnabled] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [leaveError, setLeaveError] = useState(''); // To set leave balance error from backend
    const [loading, setLoading] = useState(false);
    const [remainingLeaveDays, setRemainingLeaveDays] = useState(null); // State for remaining leave days
 
 
    // use useeffect to populate formdata when the component loads
    useEffect(() => {
        const firstName = localStorage.getItem('firstName');
        const lastName = localStorage.getItem('lastName');
        const email = localStorage.getItem('email');
        const employeeId = localStorage.getItem('employeeId');
        if(firstName && lastName && email && employeeId){
            //set the retrieved data in the form state
            setFormData(prevData => ({
                ...prevData,
                firstName: prevData.firstName || firstName,
                lastName: prevData.lastName || lastName,
                email: prevData.email || email,
                employeeId: prevData.employeeId || employeeId
            }));
        } else{
            // If the data is not found in localStorage, you can redirect or show an error
            navigate('/login'); // Redirect to login if not found
        }
    }, [navigate]); // this will run once wen the component mounts
 
 
    useEffect(() => {
        if (location.state && location.state.edit) {
            setIsEditing(true);
            setFormData(location.state);
        }
    }, [location.state]);
 
 
    const handleChange = (e) => {
        const {name, value} = e.target;
 
        // check if the field is for file upload
 
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
 
 
        if (name === 'leaveType') {
            setIsCommentsEnabled(value === 'OTHERS');
              // Call API to fetch remaining leave days when leave type changes
        fetchRemainingLeaveDays(formData.employeeId, value);
        }
 
        if (name === 'leaveStartDate' || name === 'leaveEndDate') {
            const duration = calculateDuration(
                name === 'leaveStartDate' ? value : formData.leaveStartDate,
                name === 'leaveEndDate' ? value : formData.leaveEndDate
            );
            setFormData(prevData => ({
                ...prevData,
                duration
            }));
        }
    };
 
    const handleFileChange = (event) => {
        //  const { name} = event.target;
         const file = event.target.files[0];
         setSelectedFile(file);
        setFormData(prevData => ({
            ...prevData,
            medicalDocument: file
        }));
 
    }
 
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLeaveError(''); // Reset error messages
        setErrors(false); // Reset error state
 
        // Validation: Check for medical document if leave type is "SICK" and duration > 2
        if (formData.leaveType === 'SICK' && formData.duration > 2 && !formData.medicalDocument  && !location.state?.medicalDocument) {
            setLeaveError("Please upload a document");
            return;
        }
 
        // Validation: Check for valid email
        const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|middlewaretalents\.com)$/;
        if (!emailPattern.test(formData.email)) {
            setLeaveError('Please enter a valid email address from @gmail.com or @middlewaretalents.com');
            setErrors(true);
            return;
        }
 
        // Validation: Check if all required fields are filled
        const requiredFields = [
            'firstName', 'lastName', 'employeeId', 'email', 'managerId',
            'managerName', 'managerEmail', 'leaveStartDate',
            'leaveEndDate', 'leaveType', 'duration',
        ];
 
        const hasEmptyFields = requiredFields.some(field => !formData[field]);
        console.log('Checking required fields:', requiredFields);
requiredFields.forEach(field => {
    console.log(`${field}: ${formData[field]}`);
});
 
        if (hasEmptyFields) {
            setLeaveError('Please fill in all required fields.');
            setErrors(true);
            return;
        }
 
        // Prepare FormData for submission
        const data = new FormData();
        for (const key in formData) {
            if (formData[key]) { //Check if value exists before appending
                data.append(key, formData[key]);
            }
        }
        if (selectedFile) {
            data.append("medicalDocument", selectedFile); // Attach medical document if provided
        } else if (location.state?.medicalDocument) {
            data.append("medicalDocument", location.state.medicalDocument); // Keep the previous document if editing
        }
       
 
        setLoading(true); // Indicate loading state
 
        try {
            console.log(formData);
            const url = isEditing
                ? `https://naveen-module.azurewebsites.net/api/leave/update/${formData.id}`
                : `https://naveen-module.azurewebsites.net/api/leave/submit`;
            let response;
            if (!isEditing) {
                console.log("POST Request:", formData);
                response = await axios({
                    method: 'POST',
                    url,
                    data,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
 
                });
 
            } else {
                console.log("PUT Request:", formData);
                response = await axios({
                    method: 'PUT',
                    url,
                    data: formData,
                    // headers : {
                    //   'Content-Type' :  'multipart/form-data',
                    // },
                   
 
 
                });
 
            }
 
            // Handle success
            if (response.status === 200) {
                if(isEditing){
                    navigate('/LeaveManagement');
                }
                else{
                    props.close();
                }
            } else {
                setLeaveError('Error processing the request. Please try again.');
               
            }
        } catch (error) {
            // Handle errors
            console.log(error);
            setLeaveError(error.response?.data?.message || 'Error occurred');
 
            setErrors(true);
        } finally {
            setLoading(false); // Reset loading state
        }
    };
 
    const fetchRemainingLeaveDays = async (employeeId, leaveType) => {
        try {
            const response = await axios.get('https://naveen-module.azurewebsites.net/api/leave/remaining-leaves', {
                params: { employeeId, leaveType }
            });
            setRemainingLeaveDays(response.data); // Set the remaining leave days in state
        } catch (error) {
            console.error('Error fetching remaining leave days:', error);
            setRemainingLeaveDays(null); // Reset if there's an error
        }
    };
 
   
   
 
    const calculateDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
 
        const start = new Date(startDate);
        const end = new Date(endDate);
        let totalDays = 0;
 
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const day = date.getDay();
            if (day !== 0 && day !== 6) { // Exclude weekends (0 is Sunday, 6 is Saturday)
                totalDays++;
            }
        }
 
        return totalDays;
    };
    // Update duration when both dates are set
    useEffect(() => {
        if (formData.leaveStartDate && formData.leaveEndDate) {
            const duration = calculateDuration(formData.leaveStartDate, formData.leaveEndDate);
            setFormData((prevData) => ({
                ...prevData,
                duration
            }));
        }
    }, [formData.leaveStartDate, formData.leaveEndDate]);
 
   
   //const md = formData.medicalDocument
    return (
        <div className=" py-4">
            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center font-Playfair-Display mb-6">
                {isEditing ? 'EDIT LEAVE REQUEST' : 'NEW LEAVE REQUEST'}
            </h1>
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 spaye-y-6 mb-3">
                    <div className="flex flex-col">
                        <label htmlFor="firstName" className="mb-1">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            className={'p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm'}
                            onChange={handleChange}
                            value={formData.firstName}
                        />
                        {errors && formData.firstName === '' &&
                            <span className="text-red-600 text-sm">First Name is required</span>}
                    </div>
 
                    <div className="flex flex-col">
                        <label htmlFor="lastName" className="mb-1">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            className={'p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm'}
                            onChange={handleChange}
                            value={formData.lastName}
                        />
                        {errors && formData.lastName === '' &&
                            <span className="text-red-600 text-sm">Last Name is required</span>}
                    </div>
                </div>
 
               
               
 
                {/* Employee ID and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div className="flex flex-col">
                    <label htmlFor="employeeId" className="mb-1">Employee ID</label>
                    <input
                        type="text"
                        name="employeeId"
                        className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                        onChange={handleChange}
                        value={formData.employeeId}
                    />
                    {errors && formData.employeeId === '' &&
                        <span className="text-red-600 text-sm">Employee ID is required</span>}
                </div>
                    <div className="flex flex-col">
                        <label htmlFor="email" className="mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            className={'p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm'}
                            onChange={handleChange}
                            value={formData.email}
                        />
                        {errors && formData.email === '' &&
                            <span className="text-red-600 text-sm">Email is required</span>}
                    </div>
 
                 
                </div>
 
                {/* Manager Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div className="flex flex-col">
                        <label htmlFor="managerId" className="mb-1">Manager ID</label>
                        <select
                            type="text"
                            name="managerId"
                            className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                            onChange={handleChange}
                            value={formData.managerId}>
                            <option value="">Select Manager ID</option>
                            <option value="MTL1006">MTL1006</option>
                            <option value="MTL1008">MTL1008</option>
                            <option value="MTL1009">MTL1009</option>
                        </select>
                        {errors && formData.managerId === '' &&
                            <span className="text-red-600 text-sm">Manager ID is required</span>}
                    </div>
 
                    <div className="flex flex-col">
                        <label htmlFor="managerEmail" className="mb-1">Manager Email</label>
                        <select
                            type="email"
                            name="managerEmail"
                            className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                            onChange={handleChange}
                            value={formData.managerEmail}
                        >
                            <option value="">Select Manager Email</option>
                            <option value="vani@gmail.com">vani@gmail.com</option>
                            <option value="yamuna@gmail.com">yamuna@gmail.com</option>
                            <option value="sowdhamini@gmail.com">sowdhamini@gmail.com</option>
                            <option value="swapnadamala4@gmail.com">swapnadamala4@gmail.com</option>
                        </select>
 
                    </div>
                </div>
 
                {/* Leave Dates */}
                {/* Leave Start and End Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div className="flex flex-col">
                        <label htmlFor="leaveStartDate" className="mb-1">Leave Start Date</label>
                        <input
                            type="date"
                            name="leaveStartDate"
                            className="p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm"
                            value={formData.leaveStartDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]} // Set the min attribute to today's date
                        />
                    </div>
 
                    <div className="flex flex-col">
                        <label htmlFor="leaveEndDate" className="mb-1">Leave End Date</label>
                        <input
                            type="date"
                            name="leaveEndDate"
                            className="p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm"
                            value={formData.leaveEndDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]} // Set the min attribute to today's date
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                {/* Duration */}
                <div className="flex flex-col">
                    <label htmlFor="duration" className="mb-1">Duration (Days)</label>
                    <input
                        type="text"
                        name="duration"
                        className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                        value={formData.duration}
                        readOnly
                    />
                    {errors && formData.duration === '' &&
                        <span className="text-red-600 text-sm">Duration is required</span>}
                </div>
 
                {/* Leave Type */}
                <div className="flex flex-col">
                    <label htmlFor="leaveType" className="mb-1">Leave Type</label>
                    <div className='flex items-center space-x-2'>
                        <select
                            name="leaveType"
                            className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                            onChange={handleChange}
                            value={formData.leaveType}
                        >
                            <option value="">Select Leave Type</option>
                            <option value="SICK">Sick Leave</option>
                            <option value="CASUAL">Casual Leave</option>
                            <option value="VACATION">Vacation Leave</option>
                            <option value="MARRIAGE">Marriage Leave</option>
                            <option value="MATERNITY">Maternity Leave</option>
                            <option value="PATERNITY">Paternity Leave</option>
                            <option value="OTHERS">Others</option>
                        </select>
 
                    </div>
                    {errors && formData.leaveType === '' &&
                        <span className="text-red-600 text-sm">Leave Type is required</span>}
                </div>
 
                {formData.leaveType === 'SICK' && formData.duration > 2 && (
                    <div className="flex flex-col">
                        <label htmlFor="document" className="mb-1">Upload Document</label>
                        <input
                            type="file"
                            name="document"
                            onChange={handleFileChange}
                            //value={md}
                            className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                        />
                    </div>
                )}
 
<div className="flex flex-col">
    <label htmlFor="remainingLeaveDays" className="mb-1">Remaining Leave Days</label>
    <input
        type="text"
        name="remainingLeaveDays"
        className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
        value={remainingLeaveDays !== null ? remainingLeaveDays : 'N/A'} // Show remaining leave days or N/A if not available
        readOnly
    />
</div>
 
 
           
 
 
                {/* Comments for "OTHERS" Leave Type */}
                {isCommentsEnabled && (
                    <div className="flex flex-col">
                        <label htmlFor="comments" className="mb-1">Comments</label>
                        <textarea
                            name="comments"
                            rows="4"
                            className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                            onChange={handleChange}
                            value={formData.comments}
                        ></textarea>
                    </div>
                )}
 
                {leaveError && <span className="text-red-600 text-sm">{leaveError}</span>}
                </div>
 
                <button
                    type="submit"
                    className={`w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : isEditing ? 'Update Leave' : 'Submit Leave'}
                </button>
            </form>
        </div>
    );
}
 
export default LeaveRequestForm;