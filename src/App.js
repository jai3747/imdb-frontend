// src/App.js
import { useState, useEffect, useCallback } from "react";
import { ThemeProvider } from "@emotion/react";
import {
  AppBar,
  Button,
  Paper,
  Toolbar,
  createTheme,
  Box,
  CircularProgress,
} from "@mui/material";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import {
  Brightness7 as Brightness7Icon,
  Brightness4 as Brightness4Icon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import apiService from "./services/api.service";
import metricsService from "./services/metrics.service";
import { API_CONFIG } from "./config/api.config";
import AddMovie from "./AddMovie";
import Movie from "./Movie";
import AddActor from "./AddActor";
import AddProducer from "./AddProducer";
import EditMovies from "./EditMovies";
import "./App.css";

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem("theme") || "dark");
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState({
    backend: false,
    database: false,
    actorApi: false,
    movieApi: false,
    producerApi: false,
  });

  const theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: mode === "dark" ? "#90caf9" : "#1976d2",
      },
      background: {
        default: mode === "dark" ? "#121212" : "#ffffff",
        paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
      },
    },
  });

  // Initialize metrics service
  useEffect(() => {
    metricsService.startReporting(30000); // Report every 30 seconds
    
    return () => {
      metricsService.stopReporting();
    };
  }, []);

  // Track page views
  useEffect(() => {
    const currentPage = location.pathname || '/';
    metricsService.recordPageView(currentPage);
  }, [location.pathname]);

  const checkAllStatuses = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      
      // Check backend health and database status
      let healthData;
      let backendStatus = false;
      let databaseStatus = false;
      
      try {
        healthData = await apiService.checkHealth();
        backendStatus = true;
        databaseStatus = healthData.database === "connected";
        console.log("Health check succeeded:", healthData);
        
        // Record successful API call
        const endTime = performance.now();
        metricsService.recordApiCall("health", "success", endTime - startTime);
      } catch (error) {
        console.error("Health check failed:", error);
        backendStatus = false;
        databaseStatus = false;
        
        // Record failed API call
        const endTime = performance.now();
        metricsService.recordApiCall("health", "error", endTime - startTime);
        metricsService.recordError("api", "Health check failed");
      }
      
      // Check individual API endpoints status
      let actorApiStatus = false;
      let movieApiStatus = false; 
      let producerApiStatus = false;
      
      try {
        const actorStartTime = performance.now();
        const actorStatus = await apiService.checkApiStatus(API_CONFIG.ENDPOINTS.API_STATUS.ACTOR);
        actorApiStatus = actorStatus.status === "success";
        console.log("Actor API status check:", actorStatus);
        
        // Record API call
        const actorEndTime = performance.now();
        metricsService.recordApiCall("actor-status", "success", actorEndTime - actorStartTime);
      } catch (error) {
        console.error("Actor API status check failed:", error);
        metricsService.recordError("api", "Actor API check failed");
      }
      
      try {
        const movieStartTime = performance.now();
        const movieStatus = await apiService.checkApiStatus(API_CONFIG.ENDPOINTS.API_STATUS.MOVIE);
        movieApiStatus = movieStatus.status === "success";
        console.log("Movie API status check:", movieStatus);
        
        // Record API call
        const movieEndTime = performance.now();
        metricsService.recordApiCall("movie-status", "success", movieEndTime - movieStartTime);
      } catch (error) {
        console.error("Movie API status check failed:", error);
        metricsService.recordError("api", "Movie API check failed");
      }
      
      try {
        const producerStartTime = performance.now();
        const producerStatus = await apiService.checkApiStatus(API_CONFIG.ENDPOINTS.API_STATUS.PRODUCER);
        producerApiStatus = producerStatus.status === "success";
        console.log("Producer API status check:", producerStatus);
        
        // Record API call
        const producerEndTime = performance.now();
        metricsService.recordApiCall("producer-status", "success", producerEndTime - producerStartTime);
      } catch (error) {
        console.error("Producer API status check failed:", error);
        metricsService.recordError("api", "Producer API check failed");
      }
      
      // Update statuses
      setStatuses({
        backend: backendStatus,
        database: databaseStatus,
        actorApi: actorApiStatus,
        movieApi: movieApiStatus,
        producerApi: producerApiStatus,
      });
      
      // Record service status metrics
      metricsService.recordUiInteraction("status-panel", "update");
      
      console.log("Final API Status Check:", {
        backend: backendStatus,
        database: databaseStatus,
        actorApi: actorApiStatus,
        movieApi: movieApiStatus,
        producerApi: producerApiStatus,
      });
      
    } catch (error) {
      console.error("Overall status check failed:", error);
      setStatuses({
        backend: false,
        database: false,
        actorApi: false,
        movieApi: false,
        producerApi: false,
      });
      metricsService.recordError("status-check", "Overall check failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAllStatuses();
    const interval = setInterval(checkAllStatuses, 30000);
    return () => clearInterval(interval);
  }, [checkAllStatuses]);

  useEffect(() => {
    localStorage.setItem("theme", mode);
    // Record theme change
    metricsService.recordUiInteraction("theme", mode);
  }, [mode]);

  useEffect(() => {
    console.log("Current API Status:", statuses);
  }, [statuses]);

  const StatusIndicator = ({ isOnline, label }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: isOnline ? "success.main" : "error.main",
        opacity: 0.8,
        py: 0.5,
        px: 2,
        borderRadius: 1,
        mr: 1,
      }}
    >
      {isOnline ? (
        <CheckCircleIcon sx={{ fontSize: 20, mr: 1 }} />
      ) : (
        <CancelIcon sx={{ fontSize: 20, mr: 1 }} />
      )}
      {`${label} ${isOnline ? "ONLINE" : "OFFLINE"}`}
    </Box>
  );

  const NavButton = ({ to, children }) => (
    <Button
      onClick={() => {
        navigate(to);
        metricsService.recordUiInteraction("navigation", to);
      }}
      color="inherit"
      sx={{
        mx: 1,
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      {children}
    </Button>
  );

  return (
    <ThemeProvider theme={theme}>
      <Paper
        elevation={0}
        sx={{
          minHeight: "100vh",
          borderRadius: 0,
          transition: "background-color 0.3s ease",
        }}
      >
        <AppBar position="static" color="primary">
          <Toolbar>
            <NavButton to="/">
              <span className="logo">IMDB</span>
            </NavButton>

            <Box sx={{ flexGrow: 1, display: "flex" }}>
              <NavButton to="/">ALL MOVIES</NavButton>
              <NavButton to="/add-movies">ADD MOVIES</NavButton>
              <NavButton to="/add-actor">ADD ACTOR</NavButton>
              <NavButton to="/add-producer">ADD PRODUCER</NavButton>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <StatusIndicator isOnline={statuses.backend} label="BACKEND" />
                  <StatusIndicator isOnline={statuses.database} label="DB" />
                  <StatusIndicator isOnline={statuses.actorApi} label="ACTOR" />
                  <StatusIndicator isOnline={statuses.movieApi} label="MOVIE" />
                  <StatusIndicator isOnline={statuses.producerApi} label="PRODUCER" />
                </>
              )}

              <Button
                onClick={() => {
                  checkAllStatuses();
                  metricsService.recordUiInteraction("button", "refresh-status");
                }}
                color="inherit"
                disabled={loading}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>

              <Button
                onClick={() => {
                  setMode(mode === "light" ? "dark" : "light");
                  metricsService.recordUiInteraction("button", "toggle-theme");
                }}
                color="inherit"
                startIcon={mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              >
                {mode === "light" ? "DARK" : "LIGHT"}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<Movie />} />
            <Route path="/add-movies" element={<AddMovie />} />
            <Route path="/add-actor" element={<AddActor />} />
            <Route path="/add-producer" element={<AddProducer />} />
            <Route path="movies/edit/:id" element={<EditMovies />} />
          </Routes>
        </Box>
      </Paper>
    </ThemeProvider>
  );
}

export default App;
