import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import './style.css';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import MyDropzone from '../../components/Dropzone'
import Logo from '../../assets/logo.svg';


interface Item {
  id: number,
  title: string,
  image_url: string;
}

interface UFIBGE {
  sigla: string;
}

interface UfCity {
  nome: string;
}

const CreatePoint = () => {

  const [items, setitems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })
  
  const [selectedUF, setSelectUF] = useState<string>('0');
  const [selectedcity, setSelectedCity] = useState<string>('0');
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([0,0]);
  const [selectedInitialLocation, setSelectedInitialLocation] = useState<[number, number]>([0,0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const history = useHistory()

// Pegando a localização inicial do Usuário
  useEffect(() => {
    navigator.geolocation.getCurrentPosition( position => {
      const { latitude, longitude} = position.coords;

      setSelectedInitialLocation([latitude, longitude]);
    })
  }, [])

// Chamando os itens que podem ser recolhidos.  
  useEffect(() => {
    api.get('items').then( res => {
      setitems(res.data)
    })
  }, [])

// Chamando a API com os estados.    
  useEffect(() => {
    axios.get<UFIBGE[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then( res => {
      const ufs = res.data.map(uf => uf.sigla);

      setUfs(ufs);
    })
  }, [])

// Chamando a API com os municípios.
useEffect(() => {
  if (selectedUF === '0') {
    return;
  }
    
    api.get<UfCity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
      .then( res => {
        const city = res.data.map( city => city.nome)

        setCities(city)
    })
  }, [selectedUF])


  function HandleSelectedUF(e:ChangeEvent<HTMLSelectElement>){
    setSelectUF(e.target.value)
  }

  function HandleSelectedCity(e:ChangeEvent<HTMLSelectElement>){
    setSelectedCity(e.target.value)
  }

  function HandleClickMap(e: LeafletMouseEvent){
    setSelectedLocation(
      [e.latlng.lat, e.latlng.lng]
    )
  }
  
  function HandleInputChange(e: ChangeEvent<HTMLInputElement>){
    
    const { name, value} = e.target;
    
    setFormData({ ...formData, [name]: value})
  }

  function handleSelectedItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id)

    if (alreadySelected >= 0){
    const filteredItems = selectedItems.filter(item => item !== id);
    
    setSelectedItems(filteredItems);
    }
    else {
      setSelectedItems([...selectedItems, id])
    }
  }

  async function HandleSubmit(e: FormEvent){
    e.preventDefault();
    
    const { name, email, whatsapp} = formData;
    const UF = selectedUF;
    const city = selectedcity;
    const [latitude, longitude] = selectedLocation;
    const items = selectedItems;


    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('UF', UF);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));

    if (selectedFile){
      data.append('image', selectedFile)
    }

    await api.post('points', data);

    alert('Ponto de coleta Criado!')

    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={Logo} alt="Ecoleta"/>

        <Link to="/"> 
          Voltar para Home
          <FiArrowLeft/>
        </Link>
      </header>

      <form onSubmit={HandleSubmit}>
        <h1>{ `Cadastro do 
              ponto de coleta `}</h1>

      <MyDropzone onFileUploaded={setSelectedFile}/>


      <fieldset>
        <legend>
          <h2>Dados</h2>
        </legend>

        <div className="field">
          <label htmlFor="name"> Nome da Entidade:</label>
          <input
            onChange={HandleInputChange} 
            type="text" 
            name="name" 
            id="name" />
      </div>

      <div className="field-group">

        <div className="field">
          <label htmlFor="name">E-mail:</label>
          <input
            onChange={HandleInputChange} 
            type="email" 
            name="email" 
            id="email" />
        </div>
      
        <div className="field">
        <label htmlFor="name">Whatsapp:</label>
          <input
            onChange={HandleInputChange}  
            type="text"      
            name="whatsapp" 
            id="whatsapp" />
        </div>

      </div>

      </fieldset>



      <fieldset>
        <legend>
          <h2>Endereço</h2>
          <span> Selecione o Endereço do mapa.</span>
        </legend>

      <Map center={selectedInitialLocation} zoom={15} onclick={HandleClickMap}>
        <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/> 

        <Marker position={selectedLocation} />
      </Map>


        <div className="field-group">
          <div className="field">
            <label htmlFor="uf">Estado (UF)</label>
            <select 
              value={selectedUF} 
              onChange={HandleSelectedUF} 
              name="uf" id="uf">
              <option> Selecione uma UF abaixo ...</option>
              { ufs.map(
                estado => (
                <option key={estado} value={estado}>{estado}</option>
                )
              )}  
            </select>  
          </div>

          <div className="field">
            <label htmlFor="city">Cidade:</label>
            <select 
              value={selectedcity} 
              onChange={HandleSelectedCity} 
              name="city" id="city">
              <option> Selecione uma UF abaixo ...</option>
              { cities.map(
                city => (
                <option key={city} value={city}>{city}</option>
                )
              )}  
            </select> 
          </div>
        </div>

      </fieldset>

      <fieldset>
        <legend>
          <h2>Ítens de Coleta</h2>
          <span>Selecione um ou mais ítens abaixo</span>
        </legend>
        
        <ul className="items-grid">
        { items.map(
          item => (
            <li onClick={() => handleSelectedItem(item.id)} 
              key={item.id}
              className={selectedItems.includes(item.id)? 'selected': ''}
            >
            <img src={item.image_url} alt={item.title}/>
          <span>{item.title}</span>
            </li>
          )
        )}

         
        </ul>
      </fieldset>

      <button type="submit"> Cadastrar ponto de coleta.</button>

      </form>

    </div>
  );
}

export default CreatePoint;
