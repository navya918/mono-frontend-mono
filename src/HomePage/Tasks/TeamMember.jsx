import { PlusIcon } from "@heroicons/react/16/solid"; // Importing PlusIcon from Heroicons for the button

// TeamMember functional component
const TeamMember = (props) => {
  // Destructure props to extract member data and taskCreate function
  const { member, taskCreate } = props;
  const { corporateEmail, firstName, lastName, jobRole } = member; // Destructure member properties

  // Function to handle adding a task for the member
  const addTask = () => {
    taskCreate(corporateEmail); // Call taskCreate with the member's email
  };

  return (
    <li key={corporateEmail} className="flex justify-between gap-x-6 py-5">
      <div className="flex min-w-0 gap-x-4 ml-5">
        {/* Display member's image */}
        <div className="min-w-0 flex-auto">
          {/* Member's name */}
          <p className="text-xl font-semibold leading-6 text-gray-900">{firstName} {lastName}</p>
          {/* Member's email */}
          <p className="mt-1 truncate text-xl leading-5 text-gray-500">{corporateEmail}</p>
        </div>
      </div>
      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
        {/* Member's role */}
        <p className="text-xl leading-6 text-gray-900">{jobRole}</p>
      </div>
      <div>
        {/* Button to add a task */}
        <button
          onClick={addTask} // Call addTask on button click
          type="button"
          className="mr-5 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {/* Plus icon for adding a task */}
          <PlusIcon className="-ml-0.5 mr-1.5 h-8 w-8" aria-hidden="true" />
          Add Task
        </button>
      </div>
    </li>
  );
};

export default TeamMember; // Exporting the TeamMember component
