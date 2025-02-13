import React, { useState, useEffect } from 'react';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { MdOutlineFileDownload } from 'react-icons/md';
import axios from 'axios';  // Use import instead of require
import Pagination, { getPaginationData } from './Pagination';
import Loader from "../Assets/Loader";
import Empty from '../Assets/Empty.svg';
 
 
 
export default function LeaveApprovalDashboard() {
  const [Data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [count, setCount] = useState(0);
  const [statusCount, setStatusCount] = useState({pending: 0, approved: 0, rejected: 0,});
  const [isEditing, setIsEditing] = useState({}); //state to track editing
  //state varaiables for managing modal, rejection reason, and leave date
  const [showModal, setShowModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('ALL');
   const [filteredRequests, setFilteredRequests] = useState([]);
    const [startDate, setStartDate] = useState(""); // Start date for filtering
    const [endDate, setEndDate] = useState(""); // End date for filtering
   
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);
  const managerId=localStorage.getItem("employeeId");
 
  // open modal and set selected leave ID
  const openRejectModal = (id) => {
    setSelectedLeaveId(id);
    setShowModal(true);
  };
 
  // close the modal reset reason
  const closeModal = () => {
    setShowModal(false);
    setRejectionReason("");
  };
 
 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:8085/api/leaves/manager/${managerId}`, {
          method:'GET',
          headers:{
            'Authorization' : `Bearer ${token}`,
            'Content-Type' : 'application/json'
          },
        });
        const leaves = response.data;
        // Sort leaves with new entries at the top
        setData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id))); // Assuming 'createdAt' is available
        setFilteredData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
        setFilteredRequests(leaves);
        const total = leaves.length;
        const pending = leaves.filter(leave => leave.leaveStatus === 'PENDING').length;
        const approved = leaves.filter(leave => leave.leaveStatus === 'APPROVED').length;
        const rejected = leaves.filter(leave => leave.leaveStatus === 'REJECTED').length;
 
        setCount(total);
        setStatusCount({ pending, approved, rejected });
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
      finally{
        setLoading(false);
      }
    };
    fetchData();
  }, [managerId]);
 
  const handleApprove = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:8085/api/leaves/approve/${id}`, null,  {
       
        headers:{
          'Authorization' : `Bearer ${token}`,
          'Content-Type' : 'application/json'
        },
      });
      const response = await axios.get(`http://localhost:8085/api/leaves/manager/${managerId}`, {
       
        headers:{
          'Authorization' : `Bearer ${token}`,
          'Content-Type' : 'application/json'
        },
      });
 
   
      const leaves = response.data;
      // Sort leaves with new entries at the top
      setData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setFilteredData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setFilteredRequests(leaves);
      setIsEditing({ ...isEditing, [id]: false }); //exit edit mode after approval
       // Update the status count directly
    setStatusCount((prevStatusCount) => ({
      ...prevStatusCount,
      approved: prevStatusCount.approved + 1,
      pending: Math.max(0, prevStatusCount.pending - 1), // Ensure pending does not go negative
    }));
    } catch (error) {
      console.error("Error approving leave request:", error);
    }
    finally{
      setLoading(false);
    }
  };
 
  // Handle rejection with backend integration
  const handleReject = async () => {
    setLoading(true);
    if (!rejectionReason) {
      alert("Please provide a rejection reason.");
      return;
    }
 
    try {
      console.log(rejectionReason);
      // Encode the rejectionReason to ensure proper handling of special characters
    //const encodedReason = encodeURIComponent(rejectionReason);
    const token = localStorage.getItem('token')
      await axios.put(`http://localhost:8085/api/leaves/reject/${selectedLeaveId}/${rejectionReason}`, null,  {
       
        headers:{
          'Authorization' : `Bearer ${token}`,
          'Content-Type' : 'application/json'
        },
      });
      const response = await axios.get(`http://localhost:8085/api/leaves/manager/${managerId}`, {
       
        headers:{
          'Authorization' : `Bearer ${token}`,
          'Content-Type' : 'application/json'
        },
      });
     
 
      const leaves = response.data;
      // Sort leaves with new entries at the top
      setData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setFilteredData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setFilteredRequests(leaves);
      setRejectionReason(response.data)
      setIsEditing({ ...isEditing, [selectedLeaveId]: false }); // exit edit mode after rejection
       // Update the status count directly
    setStatusCount((prevStatusCount) => ({
      ...prevStatusCount,
      rejected: prevStatusCount.rejected + 1,
      pending: Math.max(0, prevStatusCount.pending - 1), // Ensure pending does not go negative
    }));
 
      // Optionally refresh data here (for instance, refetch the leave data)
      // Close modal after rejection
      closeModal();
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
    finally{
      setLoading(false);
    }
  };
 
 
 
  const toggleEdit = (id) => {
    // Toggle the editing state for the specific leave request ID
    setIsEditing((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // This will flip the edit mode for the given leave
    }));
  };
 
  // Handle changes in date inputs
  const handleStartDateChange = (e) => {
    const value = e.target.value;
    console.log("Selected Start Date: ", value);
    setStartDate(value);
};
 
const handleEndDateChange = (e) => {
    const value = e.target.value;
    console.log("Selected End Date: ", value);
    setEndDate(value);
};
 
const handleSubmit = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      console.log("Filtering with Leave Start Date:", startDate);
      console.log("Filtering with Leave End Date:", endDate);
  } else {
      console.log("Please select both leave start and end dates.");
  }
 
};
 
 
  const applyFilters = () => {
    console.log("Leave Requests Data:", Data);
    if (!Array.isArray(Data)) return;
 
    let filtered = [...Data] // always start from original data
 
    console.log("Filtering with Start Date:", startDate);
    console.log("Filtering with End Date:", endDate);
 
 
     // Reset filters when "Show All" is clicked
     if (selectedStatus === 'ALL' && !startDate && !endDate) {
      setFilteredRequests(Data); // Show all requests
      // Reset the status counts to match the original dataset
      const total = Data.length;
      const pending = Data.filter(req => req.leaveStatus === 'PENDING').length;
      const approved = Data.filter(req => req.leaveStatus === 'APPROVED').length;
      const rejected = Data.filter(req => req.leaveStatus === 'REJECTED').length;
     
      setCount(total);
      setStatusCount({ pending, approved, rejected });
 
      console.log("Reset to original counts:", { pending, approved, rejected });
      return;
  }
 
    // Apply status filters
    if(selectedStatus !== 'ALL'){
      filtered = filtered.filter(request => request.leaveStatus === selectedStatus);
     
    }  
    //else {
  //     // If "ALL" is selected, calculate the actual counts
  //     setStatusCount({
  //         pending: Data.filter(req => req.leaveStatus === 'PENDING').length,
  //         approved: Data.filter(req => req.leaveStatus === 'APPROVED').length,
  //         rejected: Data.filter(req => req.leaveStatus === 'REJECTED').length,
  //     });
     
  // }
 
   
    console.log("Data Dates:", filteredData.leaveStartDate, filtered.leaveEndDate);
 
 
   
    // If a start date is selected, filter the leave requests that are >= start date
    if (startDate) {
      filtered = filtered.filter(request => new Date(request.leaveStartDate) >= new Date(startDate));
     
    }
   
    // If an end date is selected, filter the leave requests that are <= end date
    if (endDate) {
      filtered = filtered.filter(request => new Date(request.leaveEndDate) <= new Date(endDate));
     
    }
 
   
     // Update the counts dynamically based on filtered data
     const pending = filtered.filter(req => req.leaveStatus === 'PENDING').length;
     const approved = filtered.filter(req => req.leaveStatus === 'APPROVED').length;
     const rejected = filtered.filter(req => req.leaveStatus === 'REJECTED').length;
 
     setStatusCount({ pending, approved, rejected });
 
    setFilteredRequests(filtered);
    // Reset date filters
    setStartDate("");
    setEndDate("");
   
   
  }
 
   // call applyFilters() whenever filter is changed
 const filterByStatus = (status) => {
  setSelectedStatus(status);
 
}
 
useEffect(() => {
  if (Data.length > 0) {  // ✅ Only apply filters if Data is loaded
  applyFilters();
  }
});
 
 
 
  const filterByDateRange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    applyFilters();
   
   
  }
 
  // Get paginate data
  const {totalPages, currentItems} = getPaginationData(filteredRequests ?? [],currentPage, employeesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
 
  const headers = ["Employee", "Employee ID", "Start Date", "End Date","Leave Type", "Days", "Status", "Action"];
  const renderRowData = (data) => {
    const rowData = [
      { key: "firstName", value: data.firstName },
      { key: "employeeId", value: data.employeeId },
      { key: "leaveStartDate", value: data.leaveStartDate },
      { key: "leaveEndDate", value: data.leaveEndDate },
      {key: "leaveType", value: data.leaveType},
      { key: "duration", value: data.duration },
    ];
 
    return rowData.map((item) => (
      <div key={item.key} className="p-2 text-lg">
        {item.value}
      </div>
    ));
  };
 
 
 
  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600";
      case "PENDING":
        return "text-yellow-600";
      case "REJECTED":
        return "text-red-600";
      default:
        return "";
    }
  };
 
  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <FaCheckCircle />;
      case "PENDING":
        return <FaHourglassHalf />;
      case "REJECTED":
        return <FaTimesCircle />;
      default:
        return null;
    }
  };
 
  const renderActions = (data) => {
    // Check if the request is being edited (edit mode is toggled)
    if (isEditing[data.id]) {
      if (data.leaveStatus === "APPROVED") {
        // If the status is "APPROVED", show "Reject" and "Download" buttons when editing
        return (
          <div className="flex items-center space-x-2">
            <button
              className="text-red-500 hover:text-red-500 border border-red-400 px-3 py-2 whitespace-nowrap text-lg font-medium rounded"
              onClick={() => openRejectModal(data.id)} // Open the rejection modal
            >
              Reject
            </button>
            {data.medicalDocument && (
              <AttachmentItem
                key={data.employeeId}
                filename="medical Document"
                fileUrl={data.medicalDocument}
                icon={<MdOutlineFileDownload className="h-6 w-6 text-gray-400" />}
              />
            )}
          </div>
        );
      }
     
      if (data.leaveStatus === "REJECTED") {
        // If the status is "REJECTED", show "Approve" and "Download" buttons when editing
        return (
          <div className="flex items-center space-x-2">
            <button
              className="text-green-600 hover:text-green-500 border border-green-800 px-3 py-2 whitespace-nowrap text-lg font-medium rounded"
              onClick={() => handleApprove(data.id)} // Approve the request
            >
              Approve
            </button>
            {data.medicalDocument && (
              <AttachmentItem
                key={data.employeeId}
                filename="medical Document"
                fileUrl={data.medicalDocument}
                icon={<MdOutlineFileDownload className="h-6 w-6 text-gray-400" />}
              />
            )}
          </div>
        );
      }
    }
 
    // Default actions for when the request is not in edit mode
    if (data.leaveStatus === "PENDING") {
      return (
        <div className="flex items-center space-x-2">
          <button
            className="text-green-500 hover:text-green-500 border border-green-400 px-3 py-2 whitespace-nowrap text-lg font-medium rounded"
            onClick={() => handleApprove(data.id)} // Approve the request
          >
            Approve
          </button>
          <button
            className="text-red-500 hover:text-red-500 border border-red-400 px-3 py-2 whitespace-nowrap text-lg font-medium rounded"
            onClick={() => openRejectModal(data.id)} // Open the rejection modal
          >
            Reject
          </button>
          {data.medicalDocument && (
            <AttachmentItem
              key={data.employeeId}
              filename="medical Document"
              fileUrl={data.medicalDocument}
              icon={<MdOutlineFileDownload className="h-6 w-6 text-gray-400" />}
            />
          )}
        </div>
      );
    }
 
    // If the status is APPROVED or REJECTED, show the Edit button and download button
    return (
      <div className="flex items-center space-x-2">
        <button
          className="text-blue-500 hover:text-blue-900 border border-blue-500 px-3 py-2 whitespace-nowrap text-lg font-medium rounded"
          onClick={() => toggleEdit(data.id)} // Toggle edit mode
        >
          Edit
        </button>
        {data.medicalDocument && (
          <AttachmentItem
            key={data.employeeId}
            filename="medical Document"
            fileUrl={data.medicalDocument}
            icon={<MdOutlineFileDownload className="h-6 w-6 text-gray-400" />}
          />
        )}
      </div>
    );
  };
 
 
  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h1 className="text-2xl font-extrabold text-center ml-4">RECEIVED LEAVE REQUESTS</h1>
        <div className="flex items-center space-x-4">
                   
                    {/* Calendar for selecting start and end dates */}
                    <div>
            <form onSubmit={handleSubmit}>
                <div className="flex items-center space-x-2">
                    <input
                        type="date"
                        value={filteredData.leaveStartDate}  // Convert to yyyy-MM-dd
                         onChange={handleStartDateChange}
                        placeholder="Select start date"
                        className="p-3 border rounded-md text-md"
                    />
                    <span>to</span>
                    <input
                        type="date"
                       value={filteredData.leaveEndDate}  // Convert to yyyy-MM-dd
                       onChange={handleEndDateChange}
                        placeholder="Select end date"
                        className="p-3 border rounded-md"
                    />
                    <button
                        onClick={filterByDateRange}
                        className="ml-2 px-4 py-2 bg-blue-600 text-white text-lg rounded"
                      >
                        Filter
                      </button>
                </div>
               
            </form>
        </div>
                   
                    {/* Filter and Show All buttons */}
                    <div className="flex space-x-2">
                     
                      <button
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                          setFilteredRequests(Data); // Reset to show all requests
                           setCurrentPage(1); // Reset pagination to the first page
                        }}
                        className="ml-2 px-4 py-2 bg-gray-600 text-white text-lg rounded"
                      >
                        Show All
                      </button>
                    </div>
                  </div>
                  </div>
     
      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-blue-100 hover:bg-blue-200 text-gray-700 p-4 rounded-lg text-xl shadow-md cursor-pointer transition duration-300 ease-in-out" onClick={() => filterByStatus('ALL')}>Total Requests : {count}</button>
        </div>
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-4 rounded-lg text-xl shadow-md cursor-pointer transition duration-300 ease-in-out" onClick={() => filterByStatus('PENDING')}>Pending : {statusCount.pending}</button>
        </div>
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-4 rounded-lg text-xl shadow-md cursor-pointer transition duration-300 ease-in-out" onClick={() => filterByStatus('APPROVED')}>Approved : {statusCount.approved}</button>
        </div>
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-4 rounded-lg text-xl shadow-md cursor-pointer transition duration-300 ease-in-out" onClick={() => filterByStatus('REJECTED')}>Rejected : {statusCount.rejected}</button>
        </div>
      </div>
 
      {/* Leave Requests Table */}
      {loading ? (
  <Loader />
) : filteredData.length === 0 ? (
  <img
    className="mt-40 ml-auto mr-auto h-80 self-center"
    src={Empty}
    alt="No Data Found"
  />
) : (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
       
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              className="px-6 py-3 text-center text-md font-bold text-gray-500 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
         
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredData &&
          currentItems.map((data) => (
            <tr key={data.id} className="hover:bg-gray-50 text-center">
              {renderRowData(data).map((cell, index) => (
                <td
                  key={index}
                  className="px-6 py-4 whitespace-nowrap text-lg text-gray-900"
                >
                  {cell}
                </td>
              ))}
              <td
                className={`px-6 py-4 whitespace-nowrap text-lg font-semibold ${getStatusClass(
                  data.leaveStatus
                )}`}
              >
                <span className="flex items-center justify-center space-x-1">
                  {getStatusIcon(data.leaveStatus)}
                  {data.leaveStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap flex justify-center space-x-2">
                {renderActions(data)}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      paginate={paginate}
    />
  </div>
)
}
      {/* Rejection Reason Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-75">
          <div className="bg-white p-4 rounded-md shadow-md w-11/12 sm:w-1/3">
            <h2 className="text-xl font-bold mb-4">Reject Leave Request</h2>
            <textarea
              name='leaveReason'
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 dark:bg-gray-700 dark:text-white text-black"
              rows="4"
              placeholder="Enter rejection reason..."
              value={rejectionReason.leaveReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2 mt-4">
              <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={closeModal}>Cancel</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleReject}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
function AttachmentItem({ filename, icon, fileUrl }) {
  const handleDownload = () => {
      if (!fileUrl) {
          console.error("File URL is invalid");
          return;
      }
      // filename="medical_document.pdf"
 
 
      console.log("Downloading file:", fileUrl, filename);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", filename); // Set download filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
 
  return (
              <button variant="outline" size="lg" onClick={handleDownload}>
                  {icon}
              </button>
  );
}