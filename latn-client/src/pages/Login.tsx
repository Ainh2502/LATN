import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  InputAdornment,
  Backdrop,
} from "@mui/material";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Visibility, VisibilityOff, Close, Logout } from "@mui/icons-material";
import { gsap } from "gsap";

export default function Login() {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const { login, logout } = useAuth();

  const nav = useNavigate();
  
  // Refs for Yeti elements
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const armLRef = useRef<SVGGElement>(null);
  const armRRef = useRef<SVGGElement>(null);
  const eyeLRef = useRef<SVGGElement>(null);
  const eyeRRef = useRef<SVGGElement>(null);
  const noseRef = useRef<SVGPathElement>(null);
  const mouthRef = useRef<SVGGElement>(null);
  const mouthBGRef = useRef<SVGPathElement>(null);
  const mouthOutlineRef = useRef<SVGPathElement>(null);
  const toothRef = useRef<SVGPathElement>(null);
  const tongueRef = useRef<SVGGElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // 🔙 Khi bấm đóng sẽ quay lại trang trước
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => nav(-1), 300);
  };

  // Yeti Animation Functions - FIX LỖI TỌA ĐỘ
  const coverEyes = useCallback(() => {
    if (armLRef.current && armRRef.current) {
      gsap.to(armLRef.current, { 
        duration: 0.5, 
        x: 0, 
        y: 0, 
        rotation: 0, 
        ease: "power2.out" 
      });
      gsap.to(armRRef.current, { 
        duration: 0.5, 
        x: 0, 
        y: 0, 
        rotation: 0, 
        ease: "power2.out", 
        delay: 0.1 
      });
    }
  }, []);

  const uncoverEyes = useCallback(() => {
    if (armLRef.current && armRRef.current) {
      gsap.to(armLRef.current, { 
        duration: 0.5, 
        x: 0, 
        y: 0, 
        rotation: 105, 
        ease: "power2.out" 
      });
      gsap.to(armRRef.current, { 
        duration: 0.5, 
        x: 0, 
        y: 0, 
        rotation: -105, 
        ease: "power2.out", 
        delay: 0.1 
      });
    }
  }, []);

  const resetFace = useCallback(() => {
    const elements = [eyeLRef.current, eyeRRef.current, noseRef.current, mouthRef.current];
    elements.forEach(el => {
      if (el) {
        gsap.to(el, { 
          duration: 1, 
          x: 0, 
          y: 0, 
          rotation: 0, 
          scaleX: 1, 
          scaleY: 1, 
          ease: "expo.out" 
        });
      }
    });
  }, []);

  const updateMouth = useCallback((value: string) => {
    if (!mouthBGRef.current || !mouthOutlineRef.current || !toothRef.current || !tongueRef.current) return;

    if (value.length > 0) {
      if (value.includes("@")) {
        // Large mouth for email with @
        gsap.to([eyeLRef.current, eyeRRef.current], { 
          duration: 1, 
          scaleX: 0.65, 
          scaleY: 0.65, 
          ease: "expo.out", 
          transformOrigin: "center center" 
        });
      } else {
        // Medium mouth for typing
        gsap.to([eyeLRef.current, eyeRRef.current], { 
          duration: 1, 
          scaleX: 0.85, 
          scaleY: 0.85, 
          ease: "expo.out" 
        });
      }
    } else {
      // Small mouth for empty
      gsap.to([eyeLRef.current, eyeRRef.current], { 
        duration: 1, 
        scaleX: 1, 
        scaleY: 1, 
        ease: "expo.out" 
      });
    }
  }, []);

  // Event Handlers
  const onEmailFocus = () => {
    setIsEmailFocused(true);
    resetFace();
  };

  const onEmailBlur = () => {
    setIsEmailFocused(false);
    if (!email) {
      resetFace();
    }
  };

  const onPasswordFocus = () => {
    setIsPasswordFocused(true);
  };

  const onPasswordBlur = () => {
    setIsPasswordFocused(false);
  };

  const onEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    updateMouth(e.target.value);
  };

  const handleClickShowPassword = () => {
    const newShowPassword = !showPassword;
    setShowPassword(newShowPassword);
    
    if (newShowPassword) {
      // Khi hiện mật khẩu: bỏ che mắt
      uncoverEyes();
    } else {
      // Khi ẩn mật khẩu: che mắt lại
      coverEyes();
    }
  };

  // Initialize Yeti - MẶC ĐỊNH CHE MẮT
  useEffect(() => {
    // Set initial arm positions - CHE MẮT NGAY KHI KHỞI ĐỘNG
    if (armLRef.current && armRRef.current) {
      gsap.set(armLRef.current, { 
        x: 0, 
        y: 0, 
        rotation: 0
      });
      gsap.set(armRRef.current, { 
        x: 0, 
        y: 0, 
        rotation: 0
      });
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (user.isActive === false) {
        setDialogMessage("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.");
        setOpenDialog(true);
        logout();
        return;
      }
      // if (user.role === "ADMIN") {
      //   setDialogMessage("Tài khoản ADMIN không thể đăng nhập vào trang khách hàng.");
      //   setOpenDialog(true);
      //   logout();
      //   return;
      // }

     
      // Success animation
      if (eyeLRef.current && eyeRRef.current) {
        uncoverEyes(); // Bỏ che mắt khi đăng nhập thành công
        gsap.to([eyeLRef.current, eyeRRef.current], {
          duration: 0.5,
          scale: 1.2,
          repeat: 3,
          yoyo: true,
          ease: "power2.inOut"
        });
      }

      setOpen(false);
      setTimeout(() => nav("/"), 500);
    } catch (err) {
      setDialogMessage("Email hoặc mật khẩu không hợp lệ.");
      setOpenDialog(true);
      
      // Error animation
      if (svgContainerRef.current) {
        gsap.to(svgContainerRef.current, {
          duration: 0.1,
          x: 10,
          repeat: 5,
          yoyo: true,
          ease: "power1.inOut"
        });
      }
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        BackdropComponent={Backdrop}
        BackdropProps={{ sx: { backdropFilter: "blur(6px)" } }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            overflow: "visible",
            p: 3,
          },
        }}
      >
        {/* Nút đóng ❌ */}
        <Box position="absolute" top={10} right={10}>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>

        <DialogTitle sx={{ textAlign: "center", fontWeight: 800, mt: 1, pb: 1 }}>
          🎯 Đăng nhập LATN
        </DialogTitle>

        <DialogContent>
          {/* Yeti SVG Container */}
          <Box
            ref={svgContainerRef}
            sx={{
              position: "relative",
              width: 200,
              height: 200,
              margin: "0 auto 2em",
              borderRadius: "50%",
              background: "none",
              border: "solid 2.5px #3A5E77",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <Box sx={{ position: "relative", width: "100%", height: 0, overflow: "hidden", paddingBottom: "100%" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 200 200"
                style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              >
                <defs>
                  <circle id="armMaskPath" cx="100" cy="100" r="100"/>	
                </defs>
                <clipPath id="armMask">
                  <use xlinkHref="#armMaskPath" overflow="visible"/>
                </clipPath>
                <circle cx="100" cy="100" r="100" fill="#a9ddf3"/>
                <g className="body">
                  <path fill="#FFFFFF" d="M193.3,135.9c-5.8-8.4-15.5-13.9-26.5-13.9H151V72c0-27.6-22.4-50-50-50S51,44.4,51,72v50H32.1 c-10.6,0-20,5.1-25.8,13l0,78h187L193.3,135.9z"/>
                  <path fill="none" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M193.3,135.9 c-5.8-8.4-15.5-13.9-26.5-13.9H151V72c0-27.6-22.4-50-50-50S51,44.4,51,72v50H32.1c-10.6,0-20,5.1-25.8,13"/>
                  <path fill="#DDF1FA" d="M100,156.4c-22.9,0-43,11.1-54.1,27.7c15.6,10,34.2,15.9,54.1,15.9s38.5-5.8,54.1-15.9 C143,167.5,122.9,156.4,100,156.4z"/>
                </g>
                <g className="earL">
                  <g className="outerEar" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5">
                    <circle cx="47" cy="83" r="11.5"/>
                    <path d="M46.3 78.9c-2.3 0-4.1 1.9-4.1 4.1 0 2.3 1.9 4.1 4.1 4.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <g className="earHair">
                    <rect x="51" y="64" fill="#FFFFFF" width="15" height="35"/>
                    <path d="M53.4 62.8C48.5 67.4 45 72.2 42.8 77c3.4-.1 6.8-.1 10.1.1-4 3.7-6.8 7.6-8.2 11.6 2.1 0 4.2 0 6.3.2-2.6 4.1-3.8 8.3-3.7 12.5 1.2-.7 3.4-1.4 5.2-1.9" fill="#fff" stroke="#3a5e77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                </g>
                <g className="earR">
                  <g className="outerEar" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5">
                    <circle cx="155" cy="83" r="11.5"/>
                    <path d="M155.7 78.9c2.3 0 4.1 1.9 4.1 4.1 0 2.3-1.9 4.1-4.1 4.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <g className="earHair">
                    <rect x="131" y="64" fill="#FFFFFF" width="20" height="35"/>
                    <path d="M148.6 62.8c4.9 4.6 8.4 9.4 10.6 14.2-3.4-.1-6.8-.1-10.1.1 4 3.7 6.8 7.6 8.2 11.6-2.1 0-4.2 0-6.3.2 2.6 4.1 3.8 8.3 3.7 12.5-1.2-.7-3.4-1.4-5.2-1.9" fill="#fff" stroke="#3a5e77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                </g>
                <path className="chin" d="M84.1 121.6c2.7 2.9 6.1 5.4 9.8 7.5l.9-4.5c2.9 2.5 6.3 4.8 10.2 6.5 0-1.9-.1-3.9-.2-5.8 3 1.2 6.2 2 9.7 2.5-.3-2.1-.7-4.1-1.2-6.1" fill="none" stroke="#3a5e77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="face" fill="#DDF1FA" d="M134.5,46v35.5c0,21.815-15.446,39.5-34.5,39.5s-34.5-17.685-34.5-39.5V46"/>
                <path className="hair" fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M81.457,27.929 c1.755-4.084,5.51-8.262,11.253-11.77c0.979,2.565,1.883,5.14,2.712,7.723c3.162-4.265,8.626-8.27,16.272-11.235 c-0.737,3.293-1.588,6.573-2.554,9.837c4.857-2.116,11.049-3.64,18.428-4.156c-2.403,3.23-5.021,6.391-7.852,9.474"/>
                <g className="eyebrow">
                  <path fill="#FFFFFF" d="M138.142,55.064c-4.93,1.259-9.874,2.118-14.787,2.599c-0.336,3.341-0.776,6.689-1.322,10.037 c-4.569-1.465-8.909-3.222-12.996-5.226c-0.98,3.075-2.07,6.137-3.267,9.179c-5.514-3.067-10.559-6.545-15.097-10.329 c-1.806,2.889-3.745,5.73-5.816,8.515c-7.916-4.124-15.053-9.114-21.296-14.738l1.107-11.768h73.475V55.064z"/>
                  <path fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M63.56,55.102 c6.243,5.624,13.38,10.614,21.296,14.738c2.071-2.785,4.01-5.626,5.816-8.515c4.537,3.785,9.583,7.263,15.097,10.329 c1.197-3.043,2.287-6.104,3.267-9.179c4.087,2.004,8.427,3.761,12.996,5.226c0.545-3.348,0.986-6.696,1.322-10.037 c4.913-0.481,9.857-1.34,14.787-2.599"/>
                </g>
                <g ref={eyeLRef} className="eyeL">
                  <circle cx="85.5" cy="78.5" r="3.5" fill="#3a5e77"/>
                  <circle cx="84" cy="76" r="1" fill="#fff"/>
                </g>
                <g ref={eyeRRef} className="eyeR">
                  <circle cx="114.5" cy="78.5" r="3.5" fill="#3a5e77"/>
                  <circle cx="113" cy="76" r="1" fill="#fff"/>
                </g>
                <g ref={mouthRef} className="mouth">
                  <path ref={mouthBGRef} className="mouthBG" fill="#617E92" d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z"/>
                  <path ref={mouthOutlineRef} className="mouthOutline" fill="none" stroke="#3A5E77" strokeWidth="2.5" strokeLinejoin="round" d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z"/>
                  <path ref={toothRef} className="tooth" style={{fill:"#FFFFFF"}} d="M106,97h-4c-1.1,0-2-0.9-2-2v-2h8v2C108,96.1,107.1,97,106,97z"/>
                  <g ref={tongueRef} className="tongue">
                    <circle cx="100" cy="107" r="8" fill="#cc4a6c"/>
                    <ellipse className="tongueHighlight" cx="100" cy="100.5" rx="3" ry="1.5" opacity=".1" fill="#fff"/>
                  </g>
                </g>
                <path ref={noseRef} className="nose" d="M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z" fill="#3a5e77"/>
                <g className="arms" clipPath="url(#armMask)">
                  <g ref={armLRef} className="armL">
                    <path fill="#ddf1fa" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2.5" d="M121.3 97.4L111 58.7l38.8-10.4 20 36.1z"/>
                    <path fill="#ddf1fa" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2.5" d="M134.4 52.5l19.3-5.2c2.7-.7 5.4.9 6.1 3.5.7 2.7-.9 5.4-3.5 6.1L146 59.7M160.8 76.5l19.4-5.2c2.7-.7 5.4.9 6.1 3.5.7 2.7-.9 5.4-3.5 6.1l-18.3 4.9M158.3 66.8l23.1-6.2c2.7-.7 5.4.9 6.1 3.5.7 2.7-.9 5.4-3.5 6.1l-23.1 6.2M150.9 58.4l26-7c2.7-.7 5.4.9 6.1 3.5.7 2.7-.9 5.4-3.5 6.1l-21.3 5.7"/>
                    <path fill="#a9ddf3" d="M178.8 74.7l2.2-.6c1.1-.3 2.2.3 2.4 1.4.3 1.1-.3 2.2-1.4 2.4l-2.2.6-1-3.8zM180.1 64l2.2-.6c1.1-.3 2.2.3 2.4 1.4.3 1.1-.3 2.2-1.4 2.4l-2.2.6-1-3.8zM175.5 54.9l2.2-.6c1.1-.3 2.2.3 2.4 1.4.3 1.1-.3 2.2-1.4 2.4l-2.2.6-1-3.8zM152.1 49.4l2.2-.6c1.1-.3 2.2.3 2.4 1.4.3 1.1-.3 2.2-1.4 2.4l-2.2.6-1-3.8z"/>
                    <path fill="#fff" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M123.5 96.8c-41.4 14.9-84.1 30.7-108.2 35.5L1.2 80c33.5-9.9 71.9-16.5 111.9-21.8"/>
                    <path fill="#fff" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M108.5 59.4c7.7-5.3 14.3-8.4 22.8-13.2-2.4 5.3-4.7 10.3-6.7 15.1 4.3.3 8.4.7 12.3 1.3-4.2 5-8.1 9.6-11.5 13.9 3.1 1.1 6 2.4 8.7 3.8-1.4 2.9-2.7 5.8-3.9 8.5 2.5 3.5 4.6 7.2 6.3 11-4.9-.8-9-.7-16.2-2.7M94.5 102.8c-.6 4-3.8 8.9-9.4 14.7-2.6-1.8-5-3.7-7.2-5.7-2.5 4.1-6.6 8.8-12.2 14-1.9-2.2-3.4-4.5-4.5-6.9-4.4 3.3-9.5 6.9-15.4 10.8-.2-3.4.1-7.1 1.1-10.9M97.5 62.9c-1.7-2.4-5.9-4.1-12.4-5.2-.9 2.2-1.8 4.3-2.5 6.5-3.8-1.8-9.4-3.1-17-3.8.5 2.3 1.2 4.5 1.9 6.8-5-.6-11.2-.9-18.4-1 2 2.9.9 3.5 3.9 6.2"/>
                  </g>
                  <g ref={armRRef} className="armR">
                    <path fill="#ddf1fa" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2.5" d="M265.4 97.3l10.4-38.6-38.9-10.5-20 36.1z"/>
                    <path fill="#ddf1fa" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2.5" d="M252.4 52.4L233 47.2c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l10.3 2.8M226 76.4l-19.4-5.2c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l18.3 4.9M228.4 66.7l-23.1-6.2c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l23.1 6.2M235.8 58.3l-26-7c-2.7-.7-5.4.9-6.1 3.5-.7 2.7.9 5.4 3.5 6.1l21.3 5.7"/>
                    <path fill="#a9ddf3" d="M207.9 74.7l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8zM206.7 64l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8zM211.2 54.8l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8zM234.6 49.4l-2.2-.6c-1.1-.3-2.2.3-2.4 1.4-.3 1.1.3 2.2 1.4 2.4l2.2.6 1-3.8z"/>
                    <path fill="#fff" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M263.3 96.7c41.4 14.9 84.1 30.7 108.2 35.5l14-52.3C352 70 313.6 63.5 273.6 58.1"/>
                    <path fill="#fff" stroke="#3a5e77" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M278.2 59.3l-18.6-10 2.5 11.9-10.7 6.5 9.9 8.7-13.9 6.4 9.1 5.9-13.2 9.2 23.1-.9M284.5 100.1c-.4 4 1.8 8.9 6.7 14.8 3.5-1.8 6.7-3.6 9.7-5.5 1.8 4.2 5.1 8.9 10.1 14.1 2.7-2.1 5.1-4.4 7.1-6.8 4.1 3.4 9 7 14.7 11 1.2-3.4 1.8-7 1.7-10.9M314 66.7s5.4-5.7 12.6-7.4c1.7 2.9 3.3 5.7 4.9 8.6 3.8-2.5 9.8-4.4 18.2-5.7.1 3.1.1 6.1 0 9.2 5.5-1 12.5-1.6 20.8-1.9-1.4 3.9-2.5 8.4-2.5 8.4"/>
                  </g>				
                </g>
              </svg>
            </Box>
          </Box>

          {/* Form đăng nhập */}
          <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              ref={emailInputRef}
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={onEmailInput}
              onFocus={onEmailFocus}
              onBlur={onEmailBlur}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f3fafd',
                  '& fieldset': {
                    borderColor: '#217093',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#217093',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4eb8dd',
                  },
                },
              }}
            />

            <TextField
              ref={passwordInputRef}
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={onPasswordFocus}
              onBlur={onPasswordBlur}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f3fafd',
                  '& fieldset': {
                    borderColor: '#217093',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#217093',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4eb8dd',
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#4eb8dd",
                fontWeight: 700,
                borderRadius: 2,
                height: 50,
                fontSize: "1.1em",
                "&:hover": { bgcolor: "#217093" },
              }}
            >
              Đăng nhập
            </Button>

            <Typography align="center" sx={{ mt: 1, fontSize: 14 }}>
              <Button
                variant="text"
                sx={{
                  color: "#007BFF",
                  textTransform: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => nav("/forgot-password")}
              >
                Quên mật khẩu?
              </Button>
              {" • "}
              <Button
                variant="text"
                sx={{
                  color: "#007BFF",
                  textTransform: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => nav("/register")}
              >
                Đăng ký tài khoản
              </Button>
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog cảnh báo */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(180deg, #1b093a, #2b1560)",
            border: "2px solid #d9b35f",
            boxShadow: "0 0 25px rgba(255,215,128,0.6)",
            color: "white",
            textAlign: "center",
          },
        }}
      >
        <DialogTitle sx={{ color: "#FFD700", fontWeight: 900 }}>🔒 THÔNG BÁO</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>{dialogMessage}</Typography>
        </DialogContent>
        <Box textAlign="center" pb={2}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#FFD700",
              color: "#3a1e68",
              fontWeight: 700,
              px: 3,
              "&:hover": { bgcolor: "#ffea94" },
            }}
            onClick={() => setOpenDialog(false)}
          >
            Xác nhận
          </Button>
        </Box>
      </Dialog>
    </>
  );
}