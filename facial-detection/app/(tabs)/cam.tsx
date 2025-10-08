import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useFaceDetector, FaceDetectionOptions, Face } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core'; // Required for frame processors
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function FaceCamera() {
  const [ cameraPosition, setCameraPosition ] = useState<'front' | 'back'>('front');
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive, setIsActive ] = useState(false);
  const [ detectedFaces, setDetectedFaces ] = useState<Face[]>([]);
  const [trackedFaces, setTrackedFaces] = useState<Map<number, Face>>(new Map());


  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'accurate',
    landmarkMode: 'all',
    contourMode: 'all',
    classificationMode: 'all',          // ✅ Enable smiling, eye-open detection
    minFaceSize: 0.05,                    // ✅ Detect smaller faces
    trackingEnabled: true,              // ✅ Track faces across frames
    autoMode: true,                      // ✅ Scale coordinates to screen space
    windowWidth: Dimensions.get('window').width,
    windowHeight: Dimensions.get('window').height,
  }).current;
  
  const { detectFaces } = useFaceDetector(faceDetectionOptions)

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[]) => {
    console.log('Faces:', JSON.stringify(faces));

    setTrackedFaces(prev => {
        const updated = new Map<number, Face>();
        faces.forEach(face => {
        if (face.trackingId != null) {
            updated.set(face.trackingId, face);
        }
        });
        return updated;
    });
    setDetectedFaces(faces);
  })

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    // Log frame dimensions and pixel format
    console.log(`Frame: ${frame.width}x${frame.height} (${frame.pixelFormat})`);

    if (!isActive) {
        const faces = detectFaces(frame);
        handleDetectedFaces(faces);
        console.log('Detected faces:', detectedFaces.length);
        console.log('Tracked faces:', trackedFaces.size);
    }
    else
        console.log('Not activated.');
  }, []);

  if (!device || !hasPermission) return <View style={styles.container} />;

  return (
    <View style={{flex: 1}}>
        {isActive && (
            <View style={styles.container}>
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    frameProcessor={frameProcessor}
                    />

                {detectedFaces.map((face, index) => {
                    // const { x, y } = {x: face.bounds.x, y: face.bounds.y};
                    // const { width, height } = {width: face.bounds.width, height: face.bounds.height};
                    const { x, y, width, height } = face.bounds;

                    return (
                        <View
                        key={index}
                        style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            width,
                            height,
                            borderWidth: 2,
                            borderColor: 'lime',
                            borderRadius: 4,
                        }}
                        />
                    );
                })}

                <TouchableOpacity
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: 'red',
                        bottom: 50,
                        position: 'absolute',
                        alignSelf: 'center'
                    }}
                    onPress={() => {
                        // Set is active
                        // setIsActive(false);

                        // Change camera
                        setCameraPosition(prev => prev === 'front' ? 'back' : 'front' );
                    }}>
                </TouchableOpacity>
            </View>
            
        )}
        {!isActive && (
            <View style={styles.container}>
                {/* <Text style={styles.text}>Its inactive.</Text> */}
                {Array.from(trackedFaces.entries()).map(([id, face]) => {
                    const { x, y, width, height } = face.bounds;
                    return (
                        <View
                        key={id}
                        style={{
                            position: 'absolute',
                            left: x,
                            top: y,
                            width,
                            height,
                            borderWidth: 2,
                            borderColor: 'cyan',
                            borderRadius: 4,
                        }}
                        >
                        <Text style={{ color: 'white' }}>Face #{id}</Text>
                        </View>
                    );
                    })}

                <TouchableOpacity
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: 'green',
                        bottom: 50,
                        position: 'absolute',
                        alignSelf: 'center'
                    }}
                    onPress={() => setIsActive(true)}>

                </TouchableOpacity>
            </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'brown',
  },
  text: {
    fontFamily: 'Arial',
    fontSize: 24,
    color: 'white',
    position: 'absolute',
    bottom: 350,
    alignSelf: 'center',
    justifyContent: 'center'
  }
});
