'use client'
import React, { useState, MouseEvent, useEffect, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

interface MenuBarProps {
    onSelectMenuItem: (item: string) => void;  // 親コンポーネントに通知するコールバック関数
}

const MenuBar: React.FC<MenuBarProps> = ({ onSelectMenuItem }) => {
    const handleSelect = (eventKey: string | null) => {
        if(eventKey){
            onSelectMenuItem(eventKey);
        }
    };
    return (
        <div >
            <Navbar className="bg-body-tertiary">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto" onSelect={handleSelect}>
                            <NavDropdown title="Menu" id="Menu">
                                <NavDropdown.Item eventKey="Viewer" href="#viewer">Viewer</NavDropdown.Item>
                                <NavDropdown.Item eventKey="Talker" href="#talker">Talker</NavDropdown.Item>
                                <NavDropdown.Item eventKey="Controller" href="#controller">Controller</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item eventKey="Home" href="/">Home</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default MenuBar;