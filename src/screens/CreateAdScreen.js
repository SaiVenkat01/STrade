import React,{useState} from 'react'
import { View, Text,StyleSheet,Alert} from 'react-native'
import { TextInput,Button} from 'react-native-paper'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const CreateAdScreen = () => {
  const [name,setName] = useState('')
  const [desc,setDesc] = useState('')
  const [year,setYear] = useState('')
  const [price,setPrice] = useState('')
  const [phone,setPhone] = useState('')
  const [image,setImage] = useState("")
  //send notification to all registered users whenever a new add is posted
  //not sure if it works
   const sendNoti = ()=>{
        firestore().collection('usertoken').get().then(querySnap=>{
         const userDevicetoken =  querySnap.docs.map(docSnap=>{
                return docSnap.data().token
            })
            console.log(userDevicetoken)
            fetch('http://156b-49-206-35-46.ngrok.io/send-noti',{
                method:'post',
                headers: {
                    'Content-Type': 'application/json'
                     
                  },
                body:JSON.stringify({
                    tokens:userDevicetoken
                })   
            })
        })
   }

   const postData = async ()=>{ //posts the ad to firestore
    
       try{
             await firestore().collection('ads')
         .add({
             name,
             desc,
             year,
             price,
             phone,
             image,
             uid:auth().currentUser.uid
         })
         Alert.alert("Posted your Ad!")

       }catch(err){
         Alert.alert("Something went wrong. Please try again")
       }
       sendNoti()
       
   }


   //lauch image gallery for uploading photo
   //gives error for now
   const openCamera = ()=>{
    launchImageLibrary({quality:0.5},(fileobj)=>{   //launchCamera   //react-native-image-picker
          const source = {uri : fileobj.uri}
        const uploadTask =  storage().ref().child(`/items/${Date.now()}`).putFile(source)
        uploadTask.on('state_changed', 
        (snapshot) => {
           
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
             if(progress==100){alert("uploaded")}
        }, 
        (error) => {
           alert("something went wrong")
        }, 
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
               
                setImage(downloadURL)
            });
        }
        );
       })
   }
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Create Ad!</Text>
            <TextInput
                label="Ad title"
                value={name}
                mode="outlined"
                onChangeText={text => setName(text)}
                />
            <TextInput
                label="Describe what you are selling"
                value={desc}
                mode="outlined"
                numberOfLines={3}
                multiline={true}
                onChangeText={text => setDesc(text)}
                />
                <TextInput
                label="year of purchase"
                value={year}
                mode="outlined"
                keyboardType="numeric"
                onChangeText={text => setYear(text)}
                />
                <TextInput
                label="price in INR"
                value={price}
                mode="outlined"
                keyboardType="numeric"
                onChangeText={text => setPrice(text)}
                />
                <TextInput
                label="Your contact Number"
                value={phone}
                mode="outlined"
                keyboardType="numeric"
                onChangeText={text => setPhone(text)}
                />
               
                <Button icon="camera" style={{backgroundColor:"#cc5500"}} mode="contained" onPress={() => openCamera()}>
                     upload Image
                 </Button>
                <Button style={{backgroundColor:"#cc5500"}} disabled={image?false:true} mode="contained" onPress={() =>postData()}>
                     Post
                 </Button>
        </View>
    )
}

const styles = StyleSheet.create({
container:{
    flex:1,
    marginHorizontal:30,
    justifyContent:"space-evenly"
},
text:{
    fontSize:22,
    textAlign:"center"
}
 });


export default CreateAdScreen