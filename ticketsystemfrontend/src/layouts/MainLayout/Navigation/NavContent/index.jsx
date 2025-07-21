import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// react-bootstrap
import { Card, ListGroup } from 'react-bootstrap';

// project imports
import NavGroup from './NavGroup';
import { ConfigContext } from 'contexts/ConfigContext';

// third party
import SimpleBar from 'simplebar-react';

// assets
import logo from 'assets/images/logo.svg';
import newLogo from 'assets/images/new-logo.png';

// -----------------------|| NAV CONTENT ||-----------------------//

export default function NavContent({ navigation, activeNav }) {
  const configContext = useContext(ConfigContext);
  const { collapseLayout } = configContext.state;

  const [logoWidth, setLogoWidth] = useState('140px');

  useEffect(() => {
    const updateLogoSize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setLogoWidth('80px');
      } else if (width <= 768) {
        setLogoWidth('100px');
      } else {
        setLogoWidth('140px');
      }
    };

    updateLogoSize(); // Run on mount
    window.addEventListener('resize', updateLogoSize);

    return () => window.removeEventListener('resize', updateLogoSize);
  }, []);

  const navItems = navigation.map((item) => {
    if (item.type === 'group') {
      return <NavGroup group={item} key={`nav-group-${item.id}`} />;
    }
    return false;
  });

  const navContentNode = collapseLayout ? (
    <ListGroup variant="flush" as="ul" bsPrefix=" " className="pc-navbar">
      {navItems}
    </ListGroup>
  ) : (
    <SimpleBar style={{ height: 'calc(100vh - 70px)' }}>
      <ListGroup variant="flush" as="ul" bsPrefix=" " className="pc-navbar">createopen
        {navItems}
      </ListGroup>
    </SimpleBar>
  );

  const mHeader = (
    <div className="m-header" style={{ display:'flex', justifyContent:'center', alignContent: 'center', padding: '12px 0' }}>
      <Link to="/dashboard/sales" className="b-brand">
        <img
          src={newLogo}
          alt="logo"
          style={{ width: logoWidth, height: 'auto' }}
        />
      </Link>
    </div>
  );

  return (
    <>
      {mHeader}
      <div className="navbar-content next-scroll">{navContentNode}</div>
    </>
  );
}

NavContent.propTypes = {
  navigation: PropTypes.any,
  activeNav: PropTypes.any
};
