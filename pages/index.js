import { useState, useMemo, useEffect } from "react";
import { DrawingManager, GoogleMap, useLoadScript, Marker, Polygon, LoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from "@reach/combobox";
import "@reach/combobox/styles.css";
import { Draggable } from 'react-draggable';

export default function Places() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "drawing"],
  });

  if (!isLoaded) return <div>Loading...</div>;

  return <Map />;
}

function Map() {
    // Set up the initial map center
    const center = useMemo(() => ({ lat: 49.26016048544659, lng: -123.01855939966318 }), []);
    const [selected, setSelected] = useState(center);
    const [polygonPaths, setPolygonPaths] = useState([]);

    
    // Load polygon paths from local storage on component mount
    useEffect(() => {
        const savedPaths = JSON.parse(localStorage.getItem('polygonPaths'));
        if (savedPaths) {
        setPolygonPaths(savedPaths);
        }
    }, []);

    // Save polygon paths to local storage when they change
    useEffect(() => {
        localStorage.setItem('polygonPaths', JSON.stringify(polygonPaths));
    }, [polygonPaths]);

  
    // Event handlers for DrawingManager
    const onLoad = drawingManager => {
      console.log(drawingManager)
    }

  
    const onPolygonComplete = polygon => {
      const paths = polygon.getPath().getArray().map(latLng => {
        return { lat: latLng.lat(), lng: latLng.lng() }
      });
      setPolygonPaths(paths);
    }
  
    // Render the GoogleMap component with a Marker and DrawingManager
    return (
      <>
        <div className="places-container">
          <PlacesAutocomplete setSelected={setSelected} />
        </div>
      
        <GoogleMap
          id="drawing-manager-example"
          mapContainerClassName="map-container"
          zoom={15}
          center={selected}
        >
          {selected && <Marker position={selected} />}
          
          <DrawingManager
            onLoad={onLoad}
            defaultDrawingMode={google.maps.drawing.OverlayType.POLYGON}
            defaultOptions={{
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON]
              },
              polygonOptions: { editable: true, draggable: true }
            }}
            onPolygonComplete={onPolygonComplete}
          />
  
          {polygonPaths.length > 0 && (
            <Polygon
              paths={polygonPaths}
              options={{ strokeColor: "#FF0000", fillColor: "#FF0000" }}
            />
          )}
        </GoogleMap>
      </>
    );
  }

// Component for the PlacesAutocomplete search bar
const PlacesAutocomplete = ({ setSelected }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    setSelected({ lat, lng });
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        className="combobox-input"
        placeholder="Search an address"
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
};
