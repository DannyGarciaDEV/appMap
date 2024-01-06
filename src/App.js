import React, { useEffect, useState, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css'; // Import your CSS file for styling


const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  
  const userMarkerRef = useRef(false);
  const monumentMarkersRef = useRef([]);
  const mapRef = useRef(false);

  const monumentPing = L.icon({
    iconUrl: 'https://cdn2.iconfinder.com/data/icons/map-pins-1-01-easylines/128/yumminky-pin-57-512.png',
    iconSize: [38, 40],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const userIcon = L.icon({
    iconUrl: 'https://static.thenounproject.com/png/1631775-200.png',
    iconSize: [38, 40],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
 
  // Create markers for monuments
 const monumentsData = useMemo(() => [
    { monumentName: "Ether Monument", coordinates: [42.3548286, -71.0714514] },
    { monumentName: "Make Way for Ducklings", coordinates: [42.355517, -71.069761] },
    { monumentName: "George Washington Statue, Boston", coordinates: [42.3538483, -71.070949] },
    { monumentName: "Bagheera Fountain", coordinates: [42.354141, -71.069134] },
    { monumentName: "9/11 Memorial", coordinates: [42.35272345, -71.07077770812721] },
    { monumentName: "Triton Babies", coordinates: [42.354667, -71.069472] },
    { monumentName: "Tadeusz Kosciuszko Statue", coordinates: [42.352556, -71.069083] },
    { monumentName: "Wendell Phillips Statue", coordinates: [42.352722, -71.068333] },
    { monumentName: "Brewer Fountain", coordinates: [42.3562019, -71.0631027] },
    { monumentName: "The Embrace, Boston", coordinates: [42.354944, -71.0643675] },
    { monumentName: "Soldiers and Sailors Monument", coordinates: [42.3554667, -71.0664122] },
    { monumentName: "Boston Massacre Memorial", coordinates: [42.354284, -71.064412] },
    { monumentName: "Robert Gould Shaw and 54th Regiment Memorial", coordinates: [42.3574824, -71.0634962] },
    { monumentName: "Parkman Bandstand", coordinates: [42.354343400000005, -71.0655050505814] },
    { monumentName: "Founders Memorial", coordinates: [42.3564942, -71.0675817] },
    { monumentName: "Parkman Plaza", coordinates: [42.355329749999996, -71.06366411207054] },
], []);
useEffect(() => {
  mapRef.current = L.map('map');
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapRef.current); // Use mapRef.current instead of map

  monumentsData.forEach((monumentCoor) => {
    const [lat, lon] = monumentCoor.coordinates;
    const monumentMarker = L.marker([lat, lon], { icon: monumentPing }).addTo(mapRef.current);
    monumentMarker.bindPopup(monumentCoor.monumentName).openPopup();
    monumentMarkersRef.current.push(monumentMarker);
  });

  if ('geolocation' in navigator) {
    const successCallback = (position) => {
      const { latitude, longitude } = position.coords;

      if (userMarkerRef.current) {
        // Check if userMarkerRef.current is a valid marker instance
        if (typeof userMarkerRef.current.setLatLng === 'function') {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          console.error('userMarkerRef.current is not a valid Leaflet marker instance.');
        }
      } else {
        // Create a new marker if it doesn't exist
        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapRef.current);
        mapRef.current.setView([latitude, longitude], 24);
        userMarkerRef.current.bindPopup('This is you').openPopup();
      }
    };


    const errorCallback = (error) => {
      console.error('Error getting location:', error.message);
    };

    const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  } else {
    console.error('Geolocation is not supported by your browser.');
  }
}, [monumentsData, monumentPing, userIcon]);


const updateMapMarkers = (newMarkers) => {
  monumentMarkersRef.current.forEach((marker) => marker.removeFrom(mapRef.current));

  newMarkers.forEach((monumentCoor) => {
    const [lat, lon] = monumentCoor.coordinates;
    const monumentMarker = L.marker([lat, lon], { icon: monumentPing }).addTo(mapRef.current);
    monumentMarker.bindPopup(monumentCoor.monumentName).openPopup();
    monumentMarkersRef.current.push(monumentMarker);
  });
};

const filterAndShowSpecificMonuments = () => {
  const specificMonumentNames = ["Ether Monument", "Make Way for Ducklings", "George Washington Statue, Boston", "Bagheera Fountain", "9/11 Memorial", "Triton Babies", "Tadeusz Kosciuszko Statue", "Wendell Phillips Statue"];
  const filteredMonuments = monumentsData.filter((monument) => specificMonumentNames.includes(monument.monumentName));
  updateMapMarkers(filteredMonuments);
};

const showAdditionalMonuments = () => {
  const additionalMonumentNames = [
    "Brewer Fountain",
    "The Embrace, Boston",
    "Soldiers and Sailors Monument",
    "Boston Massacre Memorial",
    "Robert Gould Shaw and 54th Regiment Memorial",
    "Parkman Bandstand",
    "Founders Memorial",
    "Parkman Plaza",
  ];
  const additionalMonuments = monumentsData.filter((monument) =>
  additionalMonumentNames.includes(monument.monumentName)
);

updateMapMarkers(additionalMonuments);
};

const showAllMonuments = () => {
  updateMapMarkers(monumentsData);
};

const toggleMenu = () => {
  setIsMenuOpen(!isMenuOpen);
};

return (
  <div className={`main-container ${isMenuOpen ? 'menu-open' : ''}`}>
    <div className="menu-icon" onClick={toggleMenu}>
      ☰
    </div>
    <div id="map-container">
      <div id="map" className="map"></div>
      <div className="map-buttons-container">
        <button className="blue-button" onClick={filterAndShowSpecificMonuments}>Public Garden Monuments</button>
        <button className="blue-button" onClick={showAllMonuments}>Show All Monuments</button>
        <button className="blue-button" onClick={showAdditionalMonuments}>Boston Commons Monuments</button>
      </div>
    </div>
    <div className="monuments-container">
      <div className="filter-buttons">
        {/* Your existing buttons for filtering */}
      </div>
      <MonumentsList />
    </div>
  </div>
);
}
const MonumentCard = ({ title, description, img }) => (
  <div className="monument-card">
    <h2>{title}</h2>
    <p>{description}</p>
    <img src={`${img}`}alt={`${title} `} />
  </div>
);

const MonumentsList = () => {
  const monumentsData = [
    {
    title: "Brewer Fountain",
    description:
      "As we stand here, the Brewer Fountain graces the Common with historical charm. Erected in 1868, this bronze masterpiece was a gift from Boston merchant Gardner Brewer. A replica of a French original celebrated at the 1855 Paris World’s Fair, it depicts mythological figures like Neptune and Amphitrite, adding a touch of the grandeur from that distant event. Meticulously restored to its flowing state, it stands near Tremont Street Mall, offering a picturesque spot for reflection.",
      img: "./img/brewer-fountain.jpg",
  },
  {
    title: "The Embrace",
    description:
      'Step into history meeting art with "The Embrace," a 20-foot bronze sculpture commemorating a moment between Dr. Martin Luther King Jr. and Coretta Scott King during the 1964 Nobel Peace Prize celebration. Crafted by Hank Willis Thomas, it symbolizes shared struggles for justice. This privately-funded memorial stands in Freedom Plaza, honoring local civil rights champions from 1950 to 1970, inviting reflection on the enduring legacy of the Kings.',
       img: "./img/embrace.jpg",
  },
  {
    title: "Soldiers and Sailors Monument",
    description:
      "Before us stands the Soldiers and Sailors Monument, a grand tribute to Civil War servicemen unveiled in 1877. Designed by Martin Milmore, its neoclassical design atop Flagstaff Hill symbolizes the nation's healing. Beyond its historical significance, the hill remains a cherished spot for joy and community spirit, witnessing generations of laughter during winter sled rides.",
       img: "./img/SolidersandSailors.jpg",
  },
  {
    title: "Boston Massacre Memorial",
    description:
      "Near Tremont Street Mall, the Boston Massacre Memorial, erected in 1888, captures the essence of Revolution. Sculpted by Robert Kraus, it vividly portrays the scene outside the Old State House on March 5, 1770. The bas-relief panel unfolds the tragedy, immortalizing figures like Crispus Attucks. A solemn tribute, it marks a turning point in the nation's journey toward liberty.",
       img: "./img/BostonMassacreMemorial.jpg",
  },
  {
    title: "Robert Gould Shaw and 54th Regiment Memorial",
    description:
      "Gaze upon the Shaw/54th Regiment Memorial, a bronze masterpiece by Augustus Saint-Gaudens. Unveiled in 1897, it vividly portrays Colonel Robert Gould Shaw leading the first all-volunteer black regiment during the Civil War. Each soldier's face reflects personal valor, serving as a timeless reminder of bravery and equality, restored with the rededication by General Colin Powell.",
       img: "./img/robertGould.jpg",
  },
  {
    title: "Parkman Bandstand",
    description:
      "Before us is the Parkman Bandstand, a Greek temple-inspired structure dedicated in 1912. Commemorating George Francis Parkman, its design caters to musical concerts and public discourse. Restored in 1996, it continues to host events, including the annual 'Shakespeare on the Common,' weaving pastime and oratory into the park's century-long legacy.",
       img: "./img/ParkmanBandstand.jpg",
  },
  {
    title: "Founders Memorial",
    description:
      "The Founders Memorial, unveiled during the city's tercentennial celebrations, invites us to the 1630s. Depicting Boston's European settler William Blackstone greeting Governor John Winthrop's party, it signifies the city's founding ideals. Facing Beacon Street, inscriptions immortalize Winthrop's vision of a 'city upon a hill,' echoing the weighty history of Boston Common.",
       img: "./img/FoundersMemorial.jpg",
  },
  {
    title: "Parkman Plaza",
    description:
      "Parkman Plaza, inaugurated in 1960, honors George Francis Parkman's legacy. Designed by Shurcliff & Merrill, it features bronze statues representing Industry, Religion, and Learning. These sentinel figures symbolize the city's past and future, capturing the enduring essences vital to Boston's identity.",
       img: "./img/ParkmanPlaza.jpg",
  },
  {
    title: "Ether Monument",
    description:
      "The Ether Monument, an emblem of scientific achievement, stands at the confluence of art and medicine. Erected in 1868, it commemorates the first use of ether as an anesthetic. Depicting the Good Samaritan aiding an ailing man, it resonates with the groundbreaking medical history at Massachusetts General Hospital.",
       img: "./img/EtherMonument.jpg",
  },
  {
    title: "George Washington Statue",
    description:
      "The George Washington Statue, a commanding bronze figure cast in 1869, symbolizes both historical reverence and artistic ambition. Crafted to showcase Massachusetts' artistic prowess, it stands tall against the city skyline. Over the years, the sword, repeatedly targeted by vandals, has been replaced with a fiberglass replica, preserving Washington's silhouette.",
       img: "./img/GeorgeWashingtonStatue.jpg",
  },
  {
    title: "9/11 Memorial",
    description:
      "A solemn tribute to lives lost on September 11, 2001, this memorial on Arlington Street in the Public Garden is a collective symbol of reverence. Dedicated in 2004, it offers a peaceful retreat for contemplation, seamlessly integrated into the lush landscape. Inscriptions personalize the memory, creating a serene sanctuary for reflection amidst the city's rhythm.",
       img: "./img/memorial911.jpg",
  },
  {
    title: "Tadeusz Kosciuszko Statue",
    description:
      "A striking tribute to Thaddeus Kosciuszko, a Polish patriot in the American Revolution, this bronze statue captures his strategic brilliance. Unveiled in 1910, it symbolizes the enduring bonds between nations and the universal pursuit of liberty, depicting a symbolic struggle for freedom.",
       img: "./img/TadeuszKosciuszkoStatue.jpg",
  },
  {
    title: "Wendell Phillips Statue",
    description:
      "The Wendell Phillips Statue, created by Daniel Chester French, honors an abolitionist known as 'The Abolitionist’s Golden Trumpet.' It symbolizes the shattering of bondage and Phillips' fight for freedom. Positioned atop a substantial foundation, it embodies ongoing pursuits of justice and liberty.",
       img: "./img/WendellPhillipsStatue.jpg",
  },
  {
    title: "Bagheera Fountain",
    description:
      "The Bagheera Fountain, dedicated in 1986, is a bronze sculpture capturing a dynamic moment from Kipling's 'The Jungle Book.' Crafted by Lilian Saarinen, it harmoniously blends art, nature, and urban space in the Boston Public Garden.",
       img: "./img/BagheeraFountain.jpg",
  },
  {
    title: "Triton Babies",
    description:
      'Crafted by Anna Coleman Ladd in 1922, "Triton Babies" in a charming fountain captures the whimsical nature of children at play, intertwined with mythological references to Triton, a Greek god of the sea. A timeless reflection on childhood joy.',
       img: "./img/TritonBabies.jpg",
  },
  {
    title: "Make Way for Ducklings",
    description:
      'Nancy Schön\'s bronze sculptures, inspired by McCloskey\'s "Make Way for Ducklings," celebrate a beloved duck family in the Boston Public Garden. Installed in 1987, these treasured statues symbolize Boston\'s cultural embrace, donning various outfits to mark events and seasons, echoing the city\'s spirit.',
       img: "./img/MakeWayforDucklings.jpg",
  },
  ];

  return (
    <div className="monuments-list">
      {monumentsData.map((monument, index) => (
        <MonumentCard key={index} title={monument.title} description={monument.description} img={monument.img} />
      ))}
    </div>
  );
};






export default App;