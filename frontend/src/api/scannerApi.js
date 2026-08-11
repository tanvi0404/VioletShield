import axios from "axios";


const API = axios.create({

    baseURL:"http://127.0.0.1:5000"

});



// Website Scanner

export const scanWebsite = async(url)=>{

    const response = await API.post(
        "/api/scan",
        {
            url:url
        },
        {
            headers:{
                Authorization:
                "Bearer " + localStorage.getItem("token")
            }
        }
    );


    return response.data;

};




// Network Scanner

export const scanNetwork = async(domain)=>{


    const response = await API.post(
        "/api/network-scan",
        {
            domain:domain
        },
        {
            headers:{
                Authorization:
                "Bearer " + localStorage.getItem("token")
            }
        }
    );


    return response.data;

};