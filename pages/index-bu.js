import { useState, useMemo } from "react";
import { DrawingManager, GoogleMap, useLoadScript, Marker, Polygon, LoadScript} from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";


import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
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
  const center = useMemo(() => ({ lat: 49.26016048544659, lng: -123.01855939966318 }), []);
  const [selected, setSelected] = useState(center);



  const onLoad = drawingManager => {
    console.log(drawingManager)
  }
  
  const onPolygonComplete = polygon => {
    console.log(polygon)
  } 

  return (
    <>
      <div className="places-container">
        <PlacesAutocomplete setSelected={setSelected} />
      </div>
    

    



  <GoogleMap
    id="drawing-manager-example"
    mapContainerClassName="map-container"
    zoom={2.5}
    zoom={15}
    center={selected}

  >
    {selected && <Marker position={selected} />}
    
    <DrawingManager
      onLoad={onLoad}
      //onPolygonComplete={onPolygonComplete}

      defaultDrawingMode={google.maps.drawing.OverlayType.POLYGON}
          defaultOptions={{
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [google.maps.drawing.OverlayType.POLYGON]
            },
            polygonOptions: { editable: true, draggable: true }
          }}
          onPolygonComplete={value => getPaths(value)}

    />
       
   
      </GoogleMap>

    {/* <LoadScript
    
          id="script-loader"
          // googleMapsApiKey={apiKey}
          // libraries={libraries}
          language="en"
          region="us"
    > */}


      {/* <GoogleMap
        zoom={12}
        center={selected}
        mapContainerClassName="map-container"
      >
        {selected && <Marker position={selected} />}

        <DrawingManager
      onLoad={onLoad}
      onPolygonComplete={onPolygonComplete}
    />

      </GoogleMap>
    </LoadScript> */}

    </>

  );
}

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
