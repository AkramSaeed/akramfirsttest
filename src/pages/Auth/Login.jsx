import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  MdVisibility as Visibility,
  MdVisibilityOff as VisibilityOff,
  MdAccountBalance as AccountBalance,
  MdLogin as LoginIcon,
} from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import Api, { handleApiError } from "../../services/api";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Spin } from "antd";
import { Helmet } from "react-helmet-async";
import { useMutation } from "react-query";
import { ArrowLeftOutlined } from "@ant-design/icons";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("البريد الإلكتروني غير صالح")
    .required("البريد الإلكتروني مطلوب"),
  password: Yup.string().trim().required("كلمة المرور مطلوبة"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const loadUserProfile = async () => {
    try {
      const response = await Api.get("/api/profile");
      if (response.data) {
        const userData = {
          fullName: response.data.fullName,
          userName: response.data.userName,
          email: response.data.email,
          role: response.data.role,
          profileImage: response.data.profileImage,
        };
        localStorage.setItem("profile", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loginMutation = useMutation(
    async (credentials) => {
      const response = await Api.post("/api/auth/login", credentials);
      return response.data;
    },
    {
      onSuccess: async (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Load profile data after successful login
        await loadUserProfile();
        
        toast.success("تم تسجيل الدخول بنجاح!");
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
      },
      onError: (error) => {
        handleApiError(error);
        if (error?.response?.data?.message?.includes("Invalid credentials")) {
          toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else {
          toast.error("حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى");
        }
      },
    }
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(circle at top left, #ffe8a3 0%, #f2f7ff 45%, #e8f5ff 100%)",
        padding: 2,
        "&::before": {
          content: '""',
          position: "absolute",
          width: 280,
          height: 280,
          top: -80,
          left: -80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(255, 138, 101, 0.4), rgba(255, 202, 40, 0.55))",
          filter: "blur(12px)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 320,
          height: 320,
          bottom: -140,
          right: -100,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(79, 195, 247, 0.45), rgba(129, 199, 132, 0.4))",
          filter: "blur(18px)",
        },
      }}
    >
      <Helmet>
        <title>تسجيل الدخول</title>
        <meta name="description" content="تسجيل الدخول لنظام إدارة المساهمين" />
      </Helmet>
      <Card
        sx={{
          position: "relative",
          maxWidth: 470,
          width: "100%",
          borderRadius: 4,
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.85)",
          boxShadow: "0 30px 60px rgba(15, 23, 42, 0.18)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(74, 144, 226, 0.12), rgba(129, 199, 132, 0.1))",
            zIndex: 0,
          },
        }}
      >
        <CardContent sx={{ p: { xs: 4, sm: 5 }, position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <AccountBalance
              sx={{
                fontSize: 64,
                color: "#3f51b5",
                mb: 2,
                filter: "drop-shadow(0 8px 12px rgba(63, 81, 181, 0.25))",
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontFamily: "Cairo",
                fontWeight: 700,
                background: "linear-gradient(135deg, #3f51b5 0%, #009688 40%, #ff7043 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              نظام إدارة المساهمين
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "Cairo",
                color: "rgba(30, 41, 59, 0.75)",
              }}
            >
              مرحباً بك، يرجى تسجيل الدخول للمتابعة
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: 1.5,
                display: "inline-block",
                px: 2,
                py: 0.5,
                borderRadius: 999,
                fontFamily: "Cairo",
                letterSpacing: "0.02em",
                background: "rgba(63, 81, 181, 0.08)",
                color: "#3f51b5",
              }}
            >
              لوحة تحكم ملهمة لإدارة استثماراتك بسهولة
            </Typography>
          </Box>

          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              try {
                await loginMutation.mutateAsync({
                  email: values.email.trim(),
                  password: values.password,
                });
              } catch (error) {
                console.error(error);
              }
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    variant="outlined"
                    autoComplete="username"
                    disabled={loginMutation.isLoading}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "rgba(63, 81, 181, 0.25)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(63, 81, 181, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3f51b5",
                      },
                      "& .MuiInputLabel-root": {
                        fontFamily: "Cairo",
                        right: "14px",
                        left: "auto",
                        transformOrigin: "top right",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "right",
                        fontFamily: "Cairo",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="كلمة المرور"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    variant="outlined"
                    autoComplete="current-password"
                    disabled={loginMutation.isLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOff size={40} />
                            ) : (
                              <Visibility size={40} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "rgba(0, 150, 136, 0.25)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(0, 150, 136, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#009688",
                      },
                      "& .MuiInputLabel-root": {
                        fontFamily: "Cairo",
                        right: "14px",
                        left: "auto",
                        transformOrigin: "top right",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "right",
                        fontFamily: "Cairo",
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loginMutation.isLoading}
                    sx={{
                      py: 1.5,
                      background: "linear-gradient(135deg, #3f51b5 0%, #009688 45%, #ff7043 100%)",
                      fontFamily: "Cairo",
                      fontWeight: 500,
                      fontSize: "1.1rem",
                      "&:hover": {
                        background: "linear-gradient(135deg, #303f9f 0%, #00796b 45%, #f4511e 100%)",
                        boxShadow: "0 12px 24px rgba(63, 81, 181, 0.25)",
                      },
                    }}
                  >
                    {loginMutation.isLoading ? (
                      <>
                        <Spin size="small" style={{ marginLeft: 8 }} />
                        تسجيل الدخول جاري
                      </>
                    ) : (
                      <>
                        تسجيل الدخول
                        <ArrowLeftOutlined style={{ marginRight: 8 }} />
                      </>
                    )}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;