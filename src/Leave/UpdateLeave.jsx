const UpdateLeave=(props)=>{
    const {edit, updateDetails}=props;
    console.log(updateDetails);
    const isEditing=true;

   
    return(
        <div >
            <form  className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
           
            <h1 className="text-2xl font-bold text-center font-Playfair-Display mb-6">
                {isEditing ? 'EDIT LEAVE REQUEST' : 'NEW LEAVE REQUEST'}
            </h1>
               
   
 
 
                {/* Leave Dates */}
                {/* Leave Start and End Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col">
                        <label htmlFor="leaveStartDate" className="mb-1">Leave Start Date</label>
                        <input
                            type="date"
                            name="leaveStartDate"
                            className="p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm"
                            value={updateDetails.leaveStartDate}
                        />
                    </div>
 
                    <div className="flex flex-col">
                        <label htmlFor="leaveEndDate" className="mb-1">Leave End Date</label>
                        <input
                            type="date"
                            name="leaveEndDate"
                            className="p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm"
                            value={updateDetails.leaveSndDate}
                            // min={new Date().toISOString().split('T')[0]} // Set the min attribute to today's date
                            
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
                        value={updateDetails.duration}
                    />
                    
                </div>
 
                {/* Leave Type */}
                <div className="flex flex-col">
                    <label htmlFor="leaveType" className="mb-1">Leave Type</label>
                    <div className='flex items-center space-x-2'>
                        <select
                            name="leaveType"
                            className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                            value={updateDetails.leaveType}
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
                    
                </div>
 
             
                {false && (
    <div className="flex flex-col">
        <label htmlFor="document" className="mb-1">Upload Document</label>
       
        
 
        <input
            type="file"
            name="document"
            
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
         // Show remaining leave days or N/A if not available
       
        readOnly
    />
</div>
 
 
           
 
 
                {/* Comments for "OTHERS" Leave Type */}
                {false && (
                    <div className="flex flex-col">
                        <label htmlFor="comments" className="mb-1">Comments</label>
                        <textarea
                            name="comments"
                            rows="4"
                            className={`p-2 border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                           
                        ></textarea>
                    </div>
                )}
 
                {false && <span className="text-red-600 text-sm">{false}</span>}
                </div>
                {false && <div>
                    <input type="checkbox"  name="LOP"/>
                <label>LOP</label>
                    </div>}
 
                <button
                    type="submit"
                    className={`w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
                    
                >
                    {false ? 'Submitting...' : isEditing ? 'Update Leave' : 'Submit Leave'}
                </button>
 
            </form>
        </div>
    )
}

export default UpdateLeave;