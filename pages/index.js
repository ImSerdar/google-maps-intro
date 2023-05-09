import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { DrawingManager, GoogleMap, useLoadScript, Marker, Polygon, LoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from "@reach/combobox";
import "@reach/combobox/styles.css";
import { Draggable } from 'react-draggable';

// export default function Places() {
//   const { isLoaded } = useLoadScript({
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
//     libraries: ["places", "drawing"],
//   });

//   if (!isLoaded) return <div>Loading...</div>;

//   return <Map />;
// }

export default function Map() {
    // Set up the initial map center
    const center = useMemo(() => ({ lat: 49.26016048544659, lng: -123.01855939966318 }), []);
    const [selected, setSelected] = useState(center);
    const [polygonPaths, setPolygonPaths] = useState([]);
    
    const polygonRef = useRef(null);
    const listenersRef = useRef([]);
    const [path, setPath] = useState([]);
    const onEdit = useCallback(() => {
      if (polygonRef.current) {
        const nextPath = polygonRef.current
          .getPath()
          .getArray()
          .map(latLng => {
            return { lat: latLng.lat(), lng: latLng.lng() };
          });
        setPath(nextPath);
      }
    }, [setPath]);

    const onLoad = useCallback(
      polygon => {
        polygonRef.current = polygon;
        const path = polygon.getPath();
        listenersRef.current.push(
          path.addListener("set_at", onEdit),
          path.addListener("insert_at", onEdit),
          path.addListener("remove_at", onEdit)
        );
      },
      [onEdit]
    );

    
  // Clean up refs
  const onUnmount = useCallback(() => {
    listenersRef.current.forEach(lis => lis.remove());
    polygonRef.current = null;
  }, []);
  
    // // Event handlers for DrawingManager
    // const onLoad = drawingManager => {
    //   console.log(drawingManager)
    // }

  
    const onPolygonComplete = polygon => {
      const paths = polygon.getPath().getArray().map(latLng => {
        return { lat: latLng.lat(), lng: latLng.lng() }
      });
      setPolygonPaths(paths);
    }
  
    const { isLoaded } = useLoadScript({
          googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          libraries: ["places", "drawing"],
        });
      
        if (!isLoaded) return <div>Loading...</div>;

    // Render the GoogleMap component with a Marker and DrawingManager
    return (
      <>
        <div className="places-container">
          <PlacesAutocomplete setSelected={setSelected} />
        </div>
        {/* <LoadScript
        id="script-loader"
        //googleMapsApiKey= process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        language="en"
        region="us"
      > */}
        <GoogleMap
          id="drawing-manager-example"
          mapContainerClassName="map-container App-map"
          zoom={15}
          center={selected}
          version="weekly"
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
              // paths={polygonPaths}
              // options={{ strokeColor: "#FF0000", fillColor: "#FF0000" }}
              // Make the Polygon editable / draggable
              editable
              draggable
              path={path}
              // Event used when manipulating and adding points
              onMouseUp={onEdit}
              // Event used when dragging the whole Polygon
              onDragEnd={onEdit}
              onLoad={onLoad}
              onUnmount={onUnmount}
            />
          )}
        </GoogleMap>
           {/* </LoadScript> */}
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
