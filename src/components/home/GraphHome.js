import React , { useEffect, useState } from 'react';
import Card from '../card/Card';
import { gql } from 'apollo-boost'
import { useQuery } from 'react-apollo'
import styles from './home.module.css';

export default function GraphHome() {
    const [chars, setChars] = useState([]);
    const query = gql`
        {
            characters{
                results{
                    name
                    image
                }
            }
        }
    `
    let {data, loading, error} = useQuery(query);

    useEffect(() => {
        if(data && !loading && !error){
            setChars([...data.characters.results])
        }
    }, [data]);

    function nextCharacter() {
        chars.shift();
        setChars([...chars]);
    }

    if(loading) return <h2>Cargando...</h2>
    return (
        <Card 
            leftClick={nextCharacter} 
            // rightClick={addFavorites} 
            {...chars[0]} 
        />
    )
}