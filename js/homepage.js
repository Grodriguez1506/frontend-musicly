"use strict";

const welcomePage = document.querySelector(".welcomePage");
const homePage = document.querySelector(".homePage");
const welcomeText = document.querySelector(".welcomeText");
const artists = document.querySelector(".artists");
const profile = document.querySelector(".profile");
const errorAlert = document.querySelector(".errorAlert");
const logoutBtn = document.getElementById("logoutBtn");

const API_URL = "http://localhost:3900/api";

var token = localStorage.getItem("access_token");

const refreshToken = async () => {
  const response = await fetch(`${API_URL}/user/refresh`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();
  if (data.status === "success") {
    // ESTABLECER EL NUEVO ACCESS TOKEN EN EL LOCAL STORAGE
    localStorage.setItem("access_token", data.token);
    // MODIFICAR LA VARIABLE TOKEN CON EL NUEVO ACCESS TOKEN
    token = localStorage.getItem("access_token");

    return data.status;
  }

  return (document.location.href = "/login.html");
};

if (token) {
  const getPersonalData = async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        let refresh = refreshToken();
        if (refresh == "success") {
          return getPersonalData();
        }
      }

      const data = await response.json();

      return data.user;
    } catch (error) {
      document.location.href = "/login.html";
    }
  };

  const getFollowedArtist = async () => {
    try {
      const response = await fetch(`${API_URL}/follow/followed-artist`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      });

      if (response.status == 401) {
        let refresh = refreshToken();
        if (refresh == "success") {
          return getFollowedArtist();
        }
      }

      const data = await response.json();

      if (data.status == "error") {
        errorAlert.style.display = "block";
        errorAlert.innerHTML = data.message;
      }
    } catch (error) {
      document.location.href = "/login.html";
    }
  };

  const populateWelcomeText = async () => {
    const user = await getPersonalData();

    welcomeText.innerHTML = `Welcome ${user.username}`;
  };

  populateWelcomeText();

  artists.addEventListener("click", async () => {
    getFollowedArtist();
  });

  profile.addEventListener("click", async () => {
    const user = await getPersonalData();

    localStorage.setItem("user", JSON.stringify(user));
  });
} else {
  document.location.href = "/login.html";
}

const logout = async () => {
  try {
    await fetch(`${API_URL}/user/logout`);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    document.location.href = "/login.html";
  } catch (error) {
    console.log(error);
  }
};

logoutBtn.addEventListener("click", logout);
