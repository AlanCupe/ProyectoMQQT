import {React,useEffect} from 'react'
import { useNavigate } from 'react-router'


const Error = () => {
    const inicio = useNavigate()
    useEffect(()=>{
      const temporizador = setTimeout(()=>{
         inicio("/dashboard");
      },2000)
  
  
     
      return ()=>{
        clearTimeout(temporizador);
      }
    },[])
   
    return (
      <div>
          <h1>Error 404</h1>
          <p>La pagina que buscas no se encuentra</p>
         
  
              
         
          
      </div>
    )
  }

export default Error