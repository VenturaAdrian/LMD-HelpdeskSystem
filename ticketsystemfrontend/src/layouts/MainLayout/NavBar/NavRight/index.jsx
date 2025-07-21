import { Link } from 'react-router-dom';

// react-bootstrap
import { ListGroup, Dropdown, Form } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// assets
import avatar2 from 'assets/images/user/avatar-2.jpg';

import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const navigate = useNavigate()

  // Load user data from localStorage
  useEffect(() => {
    const empInfo = JSON.parse(localStorage.getItem('user'));
    setPosition(empInfo.emp_position);
    if (empInfo?.emp_FirstName) {
      const FirstName =
        empInfo.emp_FirstName.charAt(0).toUpperCase() +
        empInfo.emp_FirstName.slice(1).toLowerCase();

      const LastName =
        empInfo.emp_LastName.charAt(0).toUpperCase() +
        empInfo.emp_LastName.slice(1).toLowerCase()
      setName(FirstName + ' ' + LastName)
    }

  }, []);


  const HandleLogOut = () => {
    localStorage.removeItem('user');
    window.location.replace('/');
  }
  const HandleProfile = () => {
    navigate('/profile')
  }


  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown drp-search">
            <Form className="px-3">
              <div className="form-group mb-0 d-flex align-items-center">
                <FeatherIcon icon="search" />
                <Form.Control type="search" className="border-0 shadow-none" placeholder="Search here. . ." />
              </div>
            </Form>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown className="drp-user">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0 user-name">
            <img src={avatar2} alt="userimage" className="user-avatar" />
            <span>
              <span className="user-name">{name}</span>
              <span className="user-desc">{position}</span>
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown">

            <Link to='#' className="dropdown-item" onClick={HandleProfile}>
              <i className="feather icon-user" /> Profile
            </Link>

            <Link to="#" className="dropdown-item"
              onClick={HandleLogOut}>
              <i className="material-icons-two-tone">chrome_reader_mode</i> Logout
            </Link>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
    </ListGroup>
  );
}
