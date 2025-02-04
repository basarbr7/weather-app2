
const weatherResult = document.getElementById("weather-result");
let timeShow = document.querySelector(".showTime")
let cityList = document.querySelector(".cityList")
let input = document.querySelector('input')

const fetchWeather = async (city) => {
  const apiKey = "9bade0df4597cab62c28ef60d199912c";
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error("City not found..");
    }
    const data = await response.json();
    console.log(data);
    displayWeather(data);
    
    localStorage.setItem("lastCity", city);
  } catch (error) {
    console.log(error);
    const weatherResult = document.querySelector(".weatherResult");
    weatherResult.innerHTML = `<p class="text-white">City not found. Please try again.</p>`;
  }
};

const displayWeather = (data) => {
  if (!data || !data.sys || !data.timezone) {
    console.error("Invalid data or missing properties.");
    return;
  }

  displayTime(data);
  sunMoon(data);

  document.querySelector(".country").innerHTML = `${data.name}, ${data.sys.country}`;
  document.querySelector(".temp").innerHTML = `${Math.round(data.main.temp)}°`;
  document.querySelector(".weatherDesc").innerHTML = `${data.weather[0].description}`;
  document.querySelector(".feelsLike").innerHTML = `<span class="text-[#b9b8b8]">Feels like</span>  &nbsp ${Math.round(data.main.feels_like)}°`;
  document.querySelector(".lastFastTemp").innerHTML = `<p>Today was min Temp ${Math.round(data.main.temp_min)}°. Today was max temp ${Math.round(data.main.temp_max)}°</p>`;
  document.querySelector(".wind").innerHTML = `${(data.wind.speed * 3.6).toFixed(2)} km/h`;
  document.querySelector(".humidity").innerHTML = `${data.main.humidity}%`;
  document.querySelector(".visibility").innerHTML = `${(data.visibility) / 1000} km`;
  document.querySelector(".Pressure").innerHTML = `${data.main.pressure} mb`;
};

let timeInterval= null;
function displayTime(data){
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  const updateTime = () => {
    let weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let date = new Date();
    let timeZone = data.timezone;
    let timeZoneMiliSecond = timeZone * 1000;
    let localTime = new Date(date.getTime() + timeZoneMiliSecond);
    let hours = localTime.getUTCHours();
    let minutes = localTime.getUTCMinutes();
    let seconds = localTime.getUTCSeconds();
    let ampm = hours >= 12 ? "pm" : "am"
    let hour = hours % 12 || 12;
    
    let day = localTime.getUTCDay();
    let month = localTime.getUTCMonth()
    timeShow.innerHTML = `${months[month]}, ${weekDays[day]}, <span class="bg-[#232323a5] px-1">${hour}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}</span>`;
  };
  updateTime();
  timeInterval = setInterval(updateTime, 1000); 
}

const sunMoon = (data) => {
  const timeZoneOffset = data.timezone;
  console.log("Timezone Offset (seconds):", timeZoneOffset);

  const currentTime = new Date().getTime() + timeZoneOffset * 1000;
  console.log("Current Time (local):", new Date(currentTime).toUTCString());

  const sunriseTime = (data.sys.sunrise + timeZoneOffset) * 1000;
  const sunsetTime = (data.sys.sunset + timeZoneOffset) * 1000;
  console.log("Sunrise Time (local):", new Date(sunriseTime).toUTCString());
  console.log("Sunset Time (local):", new Date(sunsetTime).toUTCString());

  if (currentTime >= sunriseTime && currentTime < sunsetTime) {
    console.log("It's daytime.");
    document.querySelector(".sunMoon").innerHTML = `<img src="image/sunrise/${data.weather[0].main}.svg" alt="Day">`;
  } else {
    console.log("It's nighttime.");
    document.querySelector(".sunMoon").innerHTML = `<img src="image/sunset/${data.weather[0].main}.svg" alt="Night">`;
  }
};

document.getElementById("search-button").addEventListener("click", () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    fetchWeather(city);
  } else {
    weatherResult.innerHTML = `<p class="text-[#f74545] text-lg font-semibold"> Refresh browser and Enter currect City name. ...</p>`;
  }
  cityList.classList.remove("opacity-100", "visible");
  cityList.classList.add("opacity-0", "invisible");
});

async function fetchCities() {
  try {
    let response = await fetch(`https://countriesnow.space/api/v0.1/countries/population/cities`)
    let data = await response.json()
    data = data.data;
    cityList.innerHTML = ""; 

    data.forEach(item => {
      let cityButton = document.createElement("button")
        cityButton.classList.add("py-2", "bg-[#204c84]", "cursor-pointer")
        cityButton.innerHTML = item.city

        cityButton.addEventListener("click", function(){
          input.value = item.city
          fetchWeather(item.city)
          cityList.classList.remove("opacity-100", "visible");
          cityList.classList.add("opacity-0", "invisible");
        })

        cityList.append(cityButton)
    })
  } 
  catch (error) {
    console.log(error);
    cityList.innerHTML="Something is wrong....."
  }
}

input.addEventListener("input", (e)=>{
  let inputValue = e.target.value.toLowerCase();
  if(inputValue.length > 0){
    cityList.classList.add("opacity-100", "visible");
    cityList.classList.remove("opacity-0", "invisible");
  }
  else{
    cityList.classList.remove("opacity-100", "visible");
    cityList.classList.add("opacity-0", "invisible");
  }

  let filterAllButton = document.querySelectorAll(".cityList button")

  filterAllButton.forEach(item =>{
    if(item.innerHTML.toLowerCase().includes(inputValue)){
      item.classList.remove("hidden")
    }
    else{
      item.classList.add("hidden")
    }
  })
})

fetchCities()

window.onload = function () {
  const lastCity = localStorage.getItem("lastCity") || "dhaka"; 
  document.getElementById("city-input").value = lastCity;
  fetchWeather(lastCity); 
};