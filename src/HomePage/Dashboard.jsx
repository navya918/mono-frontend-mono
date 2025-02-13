import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if both email and role are present
        // const email=localStorage.getItem('email');
        
        // // console.log(email);
        
        

        // // console.log("-------------------------------------------------------");
        // const role=localStorage.getItem('role');
        // console.log("2 "+role);

        // console.log("-------------------------------------------------------");
        // console.log("3");
        

        // console.log(localStorage.getItem('email') && localStorage.getItem('role'));
        // console.log("-------------------------------------------------------");
        
        
        const isLoggedIn = localStorage.getItem('email') && localStorage.getItem('role')&&localStorage.getItem('token') ;

        // console.log("4 "+isLoggedIn);

        // console.log("-------------------------------------------------------");

        

        // console.log(localStorage.getItem('token') ===null);
        
        if (!isLoggedIn ){
             // Reload the entire application

            // If user is not logged in, redirect to login page
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div>
            <EmployeeDashboard/>
        </div>
    );
};

export default Dashboard;


