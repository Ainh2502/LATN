import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StoreIcon from '@mui/icons-material/Store';
import SettingsIcon from '@mui/icons-material/Settings';
import ReviewsIcon from '@mui/icons-material/Reviews';
import { useNavigate, useLocation } from 'react-router-dom';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CategoryIcon from '@mui/icons-material/Category';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'; // icon banner
import BarChartIcon from '@mui/icons-material/BarChart'; // ✅ thêm icon mới

const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { text: 'Tổng quan', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Tài khoản', icon: <ManageAccountsIcon />, path: '/users' },
    { text: 'Sản phẩm', icon: <ShoppingBagIcon />, path: '/products' },
    { text: 'Đơn hàng', icon: <ReceiptIcon />, path: '/orders' },
    { text: 'Thương hiệu', icon: <StoreIcon />, path: '/brands' },
    { text: 'Danh mục', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Khách hàng', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Khuyến mãi', icon: <LocalOfferIcon />, path: '/promotions' },
    { text: 'Đánh giá', icon: <ReviewsIcon />, path: '/reviews' },
      { text: 'Báo cáo & Thống kê', icon: <BarChartIcon />, path: '/reports' },
      { text: 'Banner', icon: <PhotoLibraryIcon />, path: '/banners' },
    { text: 'Cài đặt', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#fafafa',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menu.map((item) => {
          const selected = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  bgcolor: selected ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  borderLeft: selected ? '4px solid #1976d2' : '4px solid transparent',
                }}
              >
                <ListItemIcon sx={{ color: selected ? '#1976d2' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        primary: {
                          sx: {
                            fontWeight: selected ? 600 : 400,
                            color: selected ? '#1976d2' : 'inherit',
                          },
                        },
                      }}
                    />

              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
