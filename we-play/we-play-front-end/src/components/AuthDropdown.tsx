// src/components/AuthDropdown.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const AuthDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null); // Create a ref for the dropdown container

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsOpen(false); // Close the dropdown after navigating
    };

    // Use useEffect to manage the click-outside event listener
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            // Check if the click occurred outside the dropdown container
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        // Add the event listener when the dropdown is open
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        // Clean up the event listener when the component unmounts or isOpen changes
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen]); // The effect re-runs whenever the 'isOpen' state changes

    return (
        <div className="auth-dropdown-container" ref={dropdownRef}> {/* Attach the ref to the container */}
            <button onClick={toggleDropdown} className="dropdown-toggle">
                Menu
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    <button onClick={() => handleNavigation('/')} className="dropdown-item">
                        Home
                    </button>
                    <button onClick={() => handleNavigation('/login')} className="dropdown-item">
                        Login
                    </button>
                    <button onClick={() => handleNavigation('/register')} className="dropdown-item">
                        Register
                    </button>
                </div>
            )}
        </div>
        
    );
};

export default AuthDropdown;