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
        
        // Fixed: Check the correct database status field
        // Your backend returns database: { status: "connected" }, not database: "connected"
        if (healthData.database && healthData.database.status) {
          databaseStatus = healthData.database.status === "connected";
        } else if (healthData.database === "connected") {
          databaseStatus = true;
        } else {
          databaseStatus = false;
        }
        
        console.log("Health check succeeded:", healthData);
        console.log("Database status extracted:", databaseStatus);
        
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
      
      // If backend is online, check individual APIs with better error handling
      let actorApiStatus = false;
      let movieApiStatus = false; 
      let producerApiStatus = false;
      
      if (backendStatus) {
        // Check Actor API
        try {
          const actorStartTime = performance.now();
          await apiService.getActors();
          actorApiStatus = true;
          console.log("Actor API is working");
          
          const actorEndTime = performance.now();
          metricsService.recordApiCall("actor-check", "success", actorEndTime - actorStartTime);
        } catch (error) {
          console.error("Actor API check failed:", error.message);
          actorApiStatus = false;
          metricsService.recordError("api", "Actor API check failed");
        }
        
        // Check Movie API
        try {
          const movieStartTime = performance.now();
          await apiService.getMovies();
          movieApiStatus = true;
          console.log("Movie API is working");
          
          const movieEndTime = performance.now();
          metricsService.recordApiCall("movie-check", "success", movieEndTime - movieStartTime);
        } catch (error) {
          console.error("Movie API check failed:", error.message);
          movieApiStatus = false;
          metricsService.recordError("api", "Movie API check failed");
        }
        
        // Check Producer API
        try {
          const producerStartTime = performance.now();
          await apiService.getProducers();
          producerApiStatus = true;
          console.log("Producer API is working");
          
          const producerEndTime = performance.now();
          metricsService.recordApiCall("producer-check", "success", producerEndTime - producerStartTime);
        } catch (error) {
          console.error("Producer API check failed:", error.message);
          producerApiStatus = false;
          metricsService.recordError("api", "Producer API check failed");
        }
      }
      
      // Update statuses
      const newStatuses = {
        backend: backendStatus,
        database: databaseStatus,
        actorApi: actorApiStatus,
        movieApi: movieApiStatus,
        producerApi: producerApiStatus,
      };
      
      setStatuses(newStatuses);
      
      // Record service status metrics
      metricsService.recordUiInteraction("status-panel", "update");
      
      console.log("Final API Status Check:", newStatuses);
      
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
        color: "white",
        opacity: 0.9,
        py: 0.5,
        px: 2,
        borderRadius: 1,
        mr: 1,
        fontSize: "0.75rem",
        fontWeight: "bold",
      }}
    >
      {isOnline ? (
        <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5 }} />
      ) : (
        <CancelIcon sx={{ fontSize: 16, mr: 0.5 }} />
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

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                size="small"
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
                size="small"
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