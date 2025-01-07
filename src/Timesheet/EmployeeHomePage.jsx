import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import Pagination from "./Pagination";
import { FaTrash, FaEdit } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";

const EmployeeHomePage = ({ submissions, setSubmissions }) => {
  const navigate = useNavigate();
  const [filteredSubmissions, setFilteredSubmissions] = useState(submissions);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 5;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDownloadEnabled, setIsDownloadEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null); 

  useEffect(() => {
    const employeeId = localStorage.getItem("employeeId");

    const fetchSubmissions = async () => {
      try {
        let url = `https://harhsa-backend.azurewebsites.net/api/timesheets/list/${employeeId}`;

        if (startDate && endDate) {
          url = `https://harhsa-backend.azurewebsites.net/api/timesheets/totalList/employeeId/${employeeId}/startDate/${startDate}/endDate/${endDate}`;
        }

        const response = await axios.get(url);
        const data = response.data.reverse();
        setSubmissions(data);
        setFilteredSubmissions(data);
        setCounts({
          total: data.length,
          pending: data.filter((sub) => sub.status === "PENDING").length,
          approved: data.filter((sub) => sub.status === "APPROVED").length,
          rejected: data.filter((sub) => sub.status === "REJECTED").length,
        });
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, [setSubmissions, startDate, endDate]);

  const handleCreateTimesheet = () => navigate("/timesheet-management");
  const handleEditTimesheet = (submission) =>
    navigate("/timesheet-management", { state: { submission } });

  const handleDeleteTimesheet = async () => {
    try {
      await axios.delete(`https://harhsa-backend.azurewebsites.net/api/timesheets/delete/${selectedSubmissionId}`);
      const updatedSubmissions = filteredSubmissions.filter(
        (sub) => sub.id !== selectedSubmissionId
      );
      setFilteredSubmissions(updatedSubmissions);
      setSubmissions(updatedSubmissions);
      setCounts({
        total: updatedSubmissions.length,
        pending: updatedSubmissions.filter((sub) => sub.status === "PENDING").length,
        approved: updatedSubmissions.filter((sub) => sub.status === "APPROVED").length,
        rejected: updatedSubmissions.filter((sub) => sub.status === "REJECTED").length,
      });
      setShowModal(false); // Close the modal after deletion
    } catch (error) {
      console.error("Error deleting timesheet:", error);
    }
  };

  const filterSubmissions = (status) => {
    const filtered = status
      ? submissions.filter((sub) => sub.status === status)
      : submissions;
    setFilteredSubmissions(filtered);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);
  const currentSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * submissionsPerPage,
    currentPage * submissionsPerPage
  );

  const downloadTimesheets = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
 
    // Set the title for the document
    doc.text("Timesheets", 20, 20);
 
    // Define the table columns and headers
    const columns = [
      { title: "Client", dataKey: "clientName" },
      { title: "Project", dataKey: "projectName" },
      { title: "Date Range", dataKey: "dateRange" },
      { title: "Total Hours", dataKey: "totalNumberOfHours" },
      { title: "Status", dataKey: "status" },
    ];
 
    // Map the filtered submissions into rows for the table
    const rows = currentSubmissions.map(submission => ({
      clientName: submission.clientName,
      projectName: submission.projectName,
      dateRange: `${submission.startDate} - ${submission.endDate}`,
      totalNumberOfHours: submission.totalNumberOfHours,
      status: submission.status,
    }));
 
    // Add the table to the PDF
    doc.autoTable({
      head: [columns.map(col => col.title)], // Table headers
      body: rows.map(row => [
        row.clientName,
        row.projectName,
        row.dateRange,
        row.totalNumberOfHours,
        row.status,
      ]), // Table data
      startY: 30, // Position where the table will start
      theme: "grid", // Optional: Adds alternating row colors for readability
      margin: { top: 10, left: 20, right: 20 }, // Table margin
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" }, // Left-align Field column
      1: { cellWidth: "auto", halign: "left" }, // Left-align Value column
    },
    });
 
    // Save the generated PDF
    doc.save("Timesheets.pdf");
  };
 
 
const downloadTimesheet = (submission) => {
  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
 
  // Title
  doc.text(`Timesheet for ${submission.clientName}`, 20, 20);
 
  // Table data
  const tableData = [
    ["Project", submission.projectName],
    ["Date Range", `${submission.startDate} - ${submission.endDate}`],
    ["Total Hours", submission.totalNumberOfHours],
    ["Status", submission.status],
  ];
 
  // Define table options and render
  doc.autoTable({
    startY: 30, // Position of the table
    head: [["Field", "Value"]], // Table header
    body: tableData, // Table body
    theme: "grid", // Grid style for table
    margin: { top: 10, left: 20, right: 20 }, // Table margin
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" }, // Left-align Field column
      1: { cellWidth: "auto", halign: "left" }, // Left-align Value column
    },
  });
 
  // Save the document as a PDF with a dynamic file name
  doc.save(`Timesheet_${submission.clientName}_${submission.projectName}.pdf`);
};

  const handleApplyDateRange = () => {
    setIsDownloadEnabled(true);
    setCurrentPage(1);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Employee Dashboard</h1>
            </div>

            {/* Modal for Delete Confirmation */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Deletion</h2>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => setShowModal(false)} 
                      className="bg-gray-200 text-lg text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleDeleteTimesheet} 
                      className="bg-blue-600 text-lg text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <button
                onClick={handleCreateTimesheet}
                className="col-span-1 bg-blue-600 text-white rounded-lg shadow-md py-3 px-6 hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Create Timesheet
              </button>
              <button
                onClick={() => filterSubmissions()}
                className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                All: {counts.total}
              </button>
              <button
                onClick={() => filterSubmissions("PENDING")}
                className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                Pending: {counts.pending}
              </button>
              <button
                onClick={() => filterSubmissions("APPROVED")}
                className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                Approved: {counts.approved}
              </button>
              <button
                onClick={() => filterSubmissions("REJECTED")}
                className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                Rejected: {counts.rejected}
              </button>
            </div>

            <div className="mb-10">
              <label className="block text-lg font-medium text-gray-700">Filter by Date Range</label>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleApplyDateRange}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md"
                >
                  Apply Date Range
                </button>
              </div>
            </div>

            {currentSubmissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-900">
                          {submission.startDate} - {submission.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{submission.clientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{submission.projectName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">{submission.totalNumberOfHours}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-lg leading-5 font-semibold rounded-full ${
                              submission.status === "APPROVED"
                                ? "bg-blue-100 text-blue-800"
                                : submission.status === "REJECTED"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {submission.status}
                          </span>
                        </td>
                        <td className="flex px-6 py-6 gap-4 whitespace-nowrap text-lg font-medium">
                          {submission.status !== "APPROVED" && submission.status !== "REJECTED" && (
                            <div className="flex space-x-2 gap-4">
                              <button
                                className="text-blue-600 text-xl hover:text-blue-900"
                                onClick={() => handleEditTimesheet(submission)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="text-blue-600 text-xl hover:text-blue-900"
                                onClick={() => {
                                  setSelectedSubmissionId(submission.id);
                                  setShowModal(true); // Show modal when delete is clicked
                                }}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                          <button
                            className="text-grey text-xl hover:text-blue-900"
                            onClick={() => downloadTimesheet(submission)}
                          >
                            <MdOutlineFileDownload className="w-10 h-8" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-6">No timesheets submitted yet.</p>
            )}

            {isDownloadEnabled && (
              <button
                onClick={downloadTimesheets}
                className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4"
              >
                Download All Timesheets
              </button>
            )}

            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHomePage;
//c