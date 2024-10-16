'use client'
import React, { useState, MouseEvent } from 'react';

const MenuBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    const closeMenuOnOutsideClick = (e: MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };
    return (
        <div>
        <button onClick={toggleMenu}>•••</button>
        {isOpen && (
            <div className="menu-wrapper" onClick={closeMenuOnOutsideClick}>
                <nav className="menu-content">
                    <ul>
                        <li>メニュー項目1</li>
                        <li>メニュー項目2</li>
                        <li>メニュー項目3</li>
                    </ul>
                </nav>
            </div>
        )}
        </div>
    );
};

export default MenuBar;