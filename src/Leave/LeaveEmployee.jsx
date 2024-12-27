import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import axios from 'axios';  // Use 'import' syntax for axios
import Pagination, { getPaginationData } from './Pagination';
import LeaveRequestForm from './LeaveForm.jsx'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
 
export default function LeaveEmployee() {
  const [leaveRequests, setLeaveRequests] = useState([])
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  //const [editingRequest, setEditingRequest] = useState(null); // state to old the request being edited
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  //const [currentRequest, setCurrentRequest] = useState(null); // Track the request being edited
 
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [startDate, setStartDate] = useState(null); // Start date for filtering
  const [endDate, setEndDate] = useState(null); // End date for filtering
 
  const [employeesPerPage] = useState(10);
 
  useEffect(() => {
    const employeeId= localStorage.getItem('employeeId');
    console.log('Employee ID:', employeeId); // Add this to check
if (!employeeId) {
  console.log("Employee ID is missing");
  return;
}
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(`https://naveen-module.azurewebsites.net/api/leave/employee/${employeeId}`);
        console.log('Employee', employeeId);
        console.log("API Response Data:", response.data); // Log the response
        // Sort leave requests to put the most recent requests on top
        const leaves = response.data
        setLeaveRequests(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
        setFilteredRequests(leaves);  // Initially set all requests to filtered requests
 
      }
      catch (error) {
        console.log("Error fetching in leave requests", error)
      }
    }
    fetchLeaveRequests();
  }, []);
 
 
 
 
  // Filter the leave requests based on the selected start and end dates
  const filterByDateRange = () => {
    let filtered = [...leaveRequests];
    // If no start date or end date is selected, show all leave requests
  if (!startDate && !endDate) {
    setFilteredRequests(leaveRequests); // Show all requests
    return;
  }
   
    // If a start date is selected, filter the leave requests that are >= start date
    if (startDate) {
      filtered = filtered.filter(request => new Date(request.leaveStartDate) >= new Date(startDate));
    }
   
    // If an end date is selected, filter the leave requests that are <= end date
    if (endDate) {
      filtered = filtered.filter(request => new Date(request.leaveEndDate) <= new Date(endDate));
    }
 
    setFilteredRequests(filtered);
  };
 
 
  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <FaCheckCircle className="text-green-500" />
      case 'REJECTED':
        return <FaTimesCircle className="text-red-500" />
      default:
        return <FaHourglassHalf className="text-yellow-500" />
    }
  }
 
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }
 
  const handleEditRequest = (request) => {
   console.log("Request: " + request.medicalDocument)
    navigate("/LeaveForm", {
      state: {
        edit: true,
        ...request // passing all details for editing
      },
    });
  };
 
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://naveen-module.azurewebsites.net/api/leave/delete/${id}`);
      setLeaveRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== id)
      );
      alert('Leave request cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      alert('Failed to cancel leave request. Please try again.');
    }
  };
 
  const headers = ["Start Date", "End Date", "Type", "Status", "Action"];
 
  // Get paginate data
  const {totalPages, currentItems} = getPaginationData(filteredRequests, currentPage, employeesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
 
  const handleOpenModal = () => {
    setIsModalOpen(true);
  }
 
  const closeModal=()=>{
    setIsModalOpen(false);
  }
 
  const handleCloseModal = () => {
    setIsModalOpen(false);
    const employeeId= localStorage.getItem('employeeId');
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(`https://naveen-module.azurewebsites.net/api/leave/employee/${employeeId}`);
        console.log('Employee', employeeId);
        console.log("API Response Data:", response.data); // Log the response
        // Sort leave requests to put the most recent requests on top
        const leaves = response.data
        setLeaveRequests(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
 
      }
      catch (error) {
        console.log("Error fetching in leave requests", error)
      }
    }
    fetchLeaveRequests();
  }
 
  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col space-y-4 mb-6">
        {/* Heading */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Employee Submitted Leaves</h1>
           {/* Leave Request Button */}
        <div className="flex justify-end">
          <button onClick={handleOpenModal} className="px-4 py-2 bg-gray-200 text-black rounded">
            Leave Request
          </button>
        </div>
        </div>
          <div className="flex items-center space-x-4">
           
            {/* Calendar for selecting start and end dates */}
            <div className="flex items-center space-x-2 custom-datepicker-popup">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Select start date"
                className="p-3 border rounded-md text-md"
                dateFormat="yyyy/MM/dd"
                // popperClassName="custom-datepicker-popup"
              />
              <span>to</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="Select end date"
                className="p-3 border rounded-md"
                dateFormat="yyyy/MM/dd"
                // popperClassName="custom-datepicker-popup"
              />
            </div>
           
            {/* Filter and Show All buttons */}
            <div className="flex space-x-2">
              <button
                onClick={filterByDateRange}
                className="ml-4 px-4 py-2 bg-blue-600 text-white text-lg rounded"
              >
                Filter
              </button>
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setFilteredRequests(leaveRequests); // Reset to show all requests
                  setCurrentPage(1); // Reset pagination to the first page
                }}
                className="ml-4 px-4 py-2 bg-gray-600 text-white text-lg rounded"
              >
                Show All
              </button>
            </div>
          </div>
       
 
       
      </div>
 
      {/* Modal for Leave Request Form */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg min-w-96">
            <button onClick={closeModal} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"><FaTimes/></button>
            {/* You can embed your leave form component here */}
            <LeaveRequestForm close={handleCloseModal}/>
          </div>
        </div>
      )}
 
      {/* Leave Requests Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100">
                {headers.map((header) => (
                  <th key={header} className="px-5 py-3 border-b-2 border-gray-200  text-left font-semibold text-gray-700 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
 
            <tbody>
              {currentItems.map((request => (
                <tr key={request.id} className="bg-white hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-lg">
                    <p className="text-gray-900 whitespace-nowrap">{request.leaveStartDate}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-lg">
                    <p className="text-gray-900 whitespace-nowrap">{request.leaveEndDate}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-lg">
                    <p className="text-gray-900 whitespace-nowrap">{request.leaveType}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-lg">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-lg font-medium ${getStatusColor(request.leaveStatus)}`}>
                      {getStatusIcon(request.leaveStatus)}
                      <span className="ml-1">{request.leaveStatus}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-lg">
                    {request.leaveStatus === 'PENDING' && (
                      <div className="flex space-x-2">
                        <div onClick={handleOpenModal}>
                          <button
                            onClick={() => handleEditRequest(request)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <FaEdit className="mr-1 h-5 w-5" />
                          </button>
                        </div>
                       
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                          <FaTrash className="mr-1 h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />
    </div>
  )
 
}