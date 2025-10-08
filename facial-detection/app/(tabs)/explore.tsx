import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useState, useRef, useEffect } from 'react'; 
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

export default function TabTwoScreen() {
  const cameraRef = useRef<typeof Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceData, setFaceData] = useState<FaceDetector.FaceFeature[]>([]);

  useEffect(() => {
    (async () => {
      const {status} = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  function getFaceDataView() {
    if (faceData.length === 0) {
      return (
        <View style={styles.faces}>
          <Text style={styles.faceDesc}>No faces :(</Text>
        </View>
      );
    } else {
      return faceData.map((face, index) => {
        if (face && face.rightEyeOpenProbability && face.leftEyeOpenProbability && face.smilingProbability){
          const eyesShut = face.rightEyeOpenProbability < 0.4 && face.leftEyeOpenProbability < 0.4;
          const winking = !eyesShut && (face.rightEyeOpenProbability < 0.4 || face.leftEyeOpenProbability < 0.4);
          const smiling = face.smilingProbability > 0.7;
          return (
            <View style={styles.faces} key={index}>
              <Text style={styles.faceDesc}>Eyes Shut: {eyesShut.toString()}</Text>
              <Text style={styles.faceDesc}>Winking: {winking.toString()}</Text>
              <Text style={styles.faceDesc}>Smiling: {smiling.toString()}</Text>
            </View>
          );
        }
      });
    }
  }

  const handleFacesDetected = (faces: FaceDetector.FaceFeature[]) => {
    if (faces.length > 0) {      
      setFaceData(faces);
      console.log(faces);
    }
    else 
      console.log('No faces detected')
  }

  // const toggleFaceDetection = async () => {
  //   if (isDetecting) {
  //     if(cameraRef.current) {
  //       await cameraRef.current.();
  //     }
  //   } else {
  //     if(cameraRef.current) {
  //       await cameraRef.current.resumePreview();
  //     }
  //   }
  //   setIsDetecting((prev) => !prev);
  // }

  const renderFaceBoxes = () => {
    return faceData.map((face, index) => (
      <View
        key={index}
        style={[
          styles.faceBox, {
            left: face.bounds.origin.x,
            top: face.bounds.origin.y,
            width: face.bounds.size.width,
            height: face.bounds.size.height
          }
        ]}
        />
    ))
  };

  return (
    // <Camera 
    //   type={Camera.Constants.Type.front}
    //   style={styles.camera}
    //   onFacesDetected={handleFacesDetected}
    //   faceDetectorSettings={{
    //     mode: FaceDetector.FaceDetectorMode.fast,
    //     detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
    //     runClassifications: FaceDetector.FaceDetectorClassifications.none,
    //     minDetectionInterval: 100,
    //     tracking: true
    //   }}>
    //   {getFaceDataView()}
    // </Camera>
    <Text>Hello</Text>
  );
}

export type FaceData = {
  rightEyeOpenProbability?: number;
  leftEyeOpenProbability?: number;
  smilingProbability?: number;
  bounds?: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  faceID?: number;
  [key: string]: any; // fallback for other fields
};


const styles = StyleSheet.create({
  camera: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faces: {
    backgroundColor: '#ffffff',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16
  },
  faceDesc: {
    fontSize: 20
  },
  faceBox: {
    position:'absolute',
    borderColor: 'green',
    borderWidth:2,
    borderRadius:5
  }
});