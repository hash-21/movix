import React, { useRef } from "react";
import lang from "../utils/languageConstants";
import { useDispatch, useSelector } from "react-redux";
import openai from "../utils/openAi";
import {useNavigate } from "react-router-dom";
import { API_OPTIONS } from "../utils/constants";
import { addGptMovieResult } from "../utils/gptSlice";

const GptSearchBar = () => {
    const dispatch=useDispatch();
    const langKey=useSelector((store)=>store.config.lang);
    const searchText=useRef(null)
    const navigate=useNavigate()

    const searchMovieTMDB=async(movie)=>{
      const data=await fetch("https://api.themoviedb.org/3/search/movie?query="+ movie +"&include_adult=false&language=en-US&page=1", API_OPTIONS);
      const json=await data.json();

      return json.results;


    }
    
    const handleGptSearchClick=async ()=>{
        const gptQuery="Act as a Movie Recommendation System and suggest some movies for the query: "+searchText.current.value+". only give me names of 5 movies,comma separated like the example result given ahead.Example Result: Gadar, Sholay, Don, Golmaal, Koi Mil Gaya"


         const gptResults = await openai.chat.completions.create({
            messages: [{ role: 'user', content:gptQuery}],
            model: 'gpt-3.5-turbo',
          });

          if(!gptResults.choices) 
          navigate("/error")

          const gptMovies=gptResults.choices?.[0]?.message?.content.split(",");

          const promiseArray=gptMovies.map((movie)=>searchMovieTMDB(movie));

          const tmdbResults=await Promise.all(promiseArray);

          dispatch(addGptMovieResult({movieNames:gptMovies,movieResults:tmdbResults}));



    }



  return (
    <div className="pt-[35%] md:pt-[15%] flex justify-center">
      <form className="w-full md:w-1/2 bg-black grid grid-cols-12" onSubmit={(e)=>e.preventDefault()}>
        <input
        ref={searchText}
          type="text"
          className="p-4 m-4 col-span-9 "
          placeholder={lang[langKey].gptSearchPlaceholder}
        />
        <button className="col-span-3 m-4 py-2 px-4 bg-violet-600 text-white rounded-lg"
        onClick={handleGptSearchClick}>
          {lang[langKey].search}
        </button>
      </form>
    </div>
  );
};

export default GptSearchBar;
