'use client'
import React, { useState, MouseEvent, useEffect, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

const MenuBar = () => {
    return (
        <div >
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavDropdown title="Menu" id="Menu">
                                <NavDropdown.Item href="#viewer">Viewer</NavDropdown.Item>
                                <NavDropdown.Item href="#sender">Sender</NavDropdown.Item>
                                <NavDropdown.Item href="#controller">Controller</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/">None</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default MenuBar;