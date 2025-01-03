import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ChartNode from "./ChartNode";
import ProfileCard from "./ProfileCard";
import SearchError from "../Assets/searcherror.png"

export default function Chart() {
  const [originData, setOriginData] = useState([]);
  const [reportingEmployees, setReportingEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState(localStorage.getItem('employeeId')); // Initial employee ID
  const [allEmployees, setAllEmployees] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // For displaying errors
  const [searchError, setSearchError] = useState(false); // For tracking if search has no results
  const suggestionsRef = useRef(null);

  // Fetch data based on the employeeId
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log(token)
        const [originResponse] = await Promise.all([
          axios.get(`https://talents-backend.azurewebsites.net/api/v1/employeeManager/origin/${employeeId}`,{
            method:'GET',
            headers : {
              'Authorization' : `Bearer ${token}`,
              'Content-Type': "application/json"
            }
          })
        ]);

        // Setting the fetched data
        setOriginData(originResponse.data.reverse());

        // Clear any previous error messages on successful data fetch
        setErrorMessage(""); 

      } catch (error) {
        // If an error occurs (e.g., 404), set an error message
        console.error('Error fetching data:', error);
        setErrorMessage("there are no reporting employees to this person");
        setReportingEmployees([]); // Reset reporting employees in case of failure
      }

      try {
        const token = localStorage.getItem('token')
        console.log(token)
        const [ employeesResponse] = await Promise.all([
          axios.get("https://talents-backend.azurewebsites.net/api/v1/employeeManager/employees",{
            method:'GET',
            headers : {
              'Authorization' : `Bearer ${token}`,
              'Content-Type': "application/json"
            }
          })
        ]);

        // Setting the fetched data
        setAllEmployees(employeesResponse.data); // Save all employees for search functionality
        setSearchError(false); // Reset search error
        // Clear any previous error messages on successful data fetch
        setErrorMessage(""); 

      } catch (error) {
        // If an error occurs (e.g., 404), set an error message
        console.error('Error fetching data:', error);
        setErrorMessage("there are no reporting employees to this person");
        // Reset reporting employees in case of failure
      }

      try {
        const token = localStorage.getItem('token')
        console.log(token)
        const [ reportingResponse] = await Promise.all([
          axios.get(`https://talents-backend.azurewebsites.net/api/v1/employeeManager/reporting-to/${employeeId}`,{
            method:'GET',
            headers : {
              'Authorization' : `Bearer ${token}`,
              'Content-Type': "application/json"
            }
          }),
        ]);

        // Setting the fetched data
        setReportingEmployees(reportingResponse.data);

        // Clear any previous error messages on successful data fetch
        setErrorMessage(""); 

      } catch (error) {
        // If an error occurs (e.g., 404), set an error message
        console.error('Error fetching data:', error);
        setErrorMessage("There are no reporting employees");
        setReportingEmployees([]); // Reset reporting employees in case of failure
      }

    };

    fetchData();
  }, [employeeId]); // This effect runs when the employeeId changes

  // Handle employee change on suggestion click
  const changeEmployee = (newEmployeeId) => {
    setEmployeeId(newEmployeeId);  // Set the new employeeId to trigger data fetch
    setHighlightedId(newEmployeeId);  // Highlight the selected employee
  };

  // Handle search input changes
  const handleSearch = (event) => {
    const inputValue = event.target.value;
    setSearch(inputValue);

    // If search input is empty, clear suggestions
    if (inputValue === "") {
      setSearchData([]);
      setSearchError(false); // Reset search error on empty input
      return;
    }

    // Filter employees based on firstName and lastName
    const filteredData = allEmployees.filter((each) => {
      const fullName = `${each.firstName} ${each.lastName}`.toLowerCase(); // Concatenate first and last name
      return fullName.includes(inputValue.toLowerCase());
    });

    setSearchData(filteredData);

    // Set search error if no employees found
    if (filteredData.length === 0) {
      setSearchError(true);
    } else {
      setSearchError(false);
    }
  };

  // Handle suggestion click (update employeeId)
  const handleSuggestionClick = (newId) => {
    setSearch(""); // Clear the search input
    changeEmployee(newId); // Change employeeId, triggering re-fetch of data
    setSearchData([]); // Clear search suggestions
  };

  // Close suggestions if clicked outside of suggestions box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setSearchData([]); // Close suggestions when clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-8">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">Organizational Chart</h1>

      <div className="max-w-md mx-auto mb-8 relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {searchData.length === 0 && searchError && (
          <div className=" absolute z-10 w-full bg-white border border-gray-300 mt-20 rounded-md max-h-60  shadow-lg text-center">
            <img src={SearchError} alt="No results found" className="w-1/2 mx-auto my-4" />
            <p className="text-gray-600">No results found</p>
          </div>
        )}
        {searchData.length > 0 && search !== "" && !searchError && (
          <ul ref={suggestionsRef} className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md max-h-60 overflow-y-auto shadow-lg">
            {searchData.map((each) => (
              <li
                key={each.employeeId} // Ensure the key is unique for each suggestion
                onClick={() => handleSuggestionClick(each.employeeId)} // Update the employeeId on click
                className="p-3 hover:bg-blue-50 cursor-pointer transition duration-150 ease-in-out"
              >
                {each.firstName} {each.lastName} {/* Display full name */}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!searchError && (
        <div className="flex flex-col text-center items-center space-y-8">
          <div className="w-full max-w-4xl overflow-x-auto">
            <div className="inline-flex flex-col items-center space-y-4 p-4">
              {originData.map((each, index) => (
                <div key={each.employeeId} className="flex flex-col items-center">
                  <ChartNode
                    employee={each}
                    changeEmployee={changeEmployee}
                    isHighlighted={highlightedId === each.employeeId} // Highlight the selected employee
                  />
                  {index < originData.length - 1 && (
                    <div className="w-px h-8 bg-blue-400"></div> // Vertical line between nodes
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full max-w-6xl space-y-8 md:space-y-0 md:space-x-8">
            <div className="flex-1">
              <ProfileCard employeeId={employeeId} /> {/* Pass the employeeId to display profile */}
            </div>

            {reportingEmployees.length > 0 ? (
              <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-blue-800 mb-4">Reporting Employees</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {reportingEmployees.map((each) => (
                    <ChartNode
                      key={each.employeeId} // Ensure the key is unique for reporting employees
                      employee={each}
                      changeEmployee={changeEmployee}
                      isHighlighted={highlightedId === each.employeeId} // Highlight reporting employees
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-blue-800 mb-4">Reporting Employees</h2>
                <p className="text-gray-600">{errorMessage || "This employee has no direct reports."}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
