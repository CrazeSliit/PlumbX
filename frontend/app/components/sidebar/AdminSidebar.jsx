import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  IconButton,
  ListItemButton
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  LocalShipping,
  AttachMoney,
  Settings,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ExitToApp,
  Person,
  EventNote,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar = ({ open, onClose }) => {
  const pathname = usePathname();
  const [usersOpen, setUsersOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [employeeOpen, setEmployeeOpen] = useState(false);

  const toggleUsers = () => {
    setUsersOpen(!usersOpen);
  };

  const toggleInventory = () => {
    setInventoryOpen(!inventoryOpen);
  };
  
  const toggleEmployee = () => {
    setEmployeeOpen(!employeeOpen);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
        }}
      >
        <h2>Admin Panel</h2>
        <IconButton onClick={onClose}>
          <MenuIcon />
        </IconButton>
      </div>
      <Divider />
      <List>
        <ListItem
          button
          component={Link}
          href="/admin"
          selected={pathname === '/admin'}
          onClick={onClose}
        >
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem button onClick={toggleUsers}>
          <ListItemIcon>
            <People />
          </ListItemIcon>
          <ListItemText primary="Users" />
          {usersOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={usersOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              href="/admin/users"
              selected={pathname === '/admin/users'}
              onClick={onClose}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="All Users" />
            </ListItem>
            <ListItem
              button
              component={Link}
              href="/admin/users/add"
              selected={pathname === '/admin/users/add'}
              onClick={onClose}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Add User" />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button onClick={toggleEmployee}>
          <ListItemIcon>
            <People />
          </ListItemIcon>
          <ListItemText primary="Employees" />
          {employeeOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={employeeOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              href="/admin/employees"
              selected={pathname === '/admin/employees'}
              onClick={onClose}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="All Employees" />
            </ListItem>
            <ListItem
              button
              component={Link}
              href="/admin/leave-history"
              selected={pathname === '/admin/leave-history'}
              onClick={onClose}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <EventNote />
              </ListItemIcon>
              <ListItemText primary="Leave History" />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button onClick={toggleInventory}>
          <ListItemIcon>
            <Inventory />
          </ListItemIcon>
          <ListItemText primary="Inventory" />
          {inventoryOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={inventoryOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              component={Link}
              href="/admin/inventory"
              selected={pathname === '/admin/inventory'}
              onClick={onClose}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <Inventory />
              </ListItemIcon>
              <ListItemText primary="All Products" />
            </ListItem>
            <ListItem
              button
              component={Link}
              href="/admin/inventory/add"
              selected={pathname === '/admin/inventory/add'}
              onClick={onClose}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <Inventory />
              </ListItemIcon>
              <ListItemText primary="Add Product" />
            </ListItem>
          </List>
        </Collapse>

        <ListItem
          button
          component={Link}
          href="/admin/delivery"
          selected={pathname === '/admin/delivery'}
          onClick={onClose}
        >
          <ListItemIcon>
            <LocalShipping />
          </ListItemIcon>
          <ListItemText primary="Delivery" />
        </ListItem>

        <ListItem
          button
          component={Link}
          href="/admin/finance"
          selected={pathname === '/admin/finance'}
          onClick={onClose}
        >
          <ListItemIcon>
            <AttachMoney />
          </ListItemIcon>
          <ListItemText primary="Finance" />
        </ListItem>

        <ListItem
          button
          component={Link}
          href="/admin/settings"
          selected={pathname === '/admin/settings'}
          onClick={onClose}
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>

        <Divider />
        
        <ListItem
          button
          component={Link}
          href="/logout"
          onClick={onClose}
        >
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default AdminSidebar; 