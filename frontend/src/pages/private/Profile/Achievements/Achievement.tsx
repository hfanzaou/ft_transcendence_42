import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Table, Group, Text, Menu, rem, Image, Card, Container, SimpleGrid } from '@mantine/core';
import { IconMessages, IconTrash} from '@tabler/icons-react';
import {MdChevronLeft, MdChevronRight} from 'react-icons/md';
import {MdChildFriendly} from 'react-icons/md';
import AchievementsCards from './AchievementCards';
import data from './AllAchievement.json';
// import testDataAchievement from './testDataAchievement.json';
import AchievementsInterface from './AchievementInterface';
import axios from 'axios';


{/*
    Achievement :
    [achievement name]: {achievement description}
    [achievement name]: Taked when play the first game
    [achievement name]: Taked when win in 3 game and go to level 1
    [achievement name]: Taked when win a game without damage [45 - 0]
    [achievement name]: Taked when add first friend
    [achievement name]: Taked when have 3 friends
*/}


function  Achievement() {
    const [achievements, setAchievements] = useState<AchievementsInterface>({});

    useEffect(() => {
        const getAchievements = async () => {
            await axios.get("user/achievements")
            .then((res) => {
            // console.log("Achievement from res: ", res.data.achievement1);
            setAchievements(res.data);
        })
        .catch((err) => {
            console.error("error in fetching Matchs History: ", err );
        })
    };
    getAchievements();
}, []);

data[0].type = achievements['achievement1'];
data[1].type = achievements['achievement2'];
data[2].type = achievements['achievement3'];
data[3].type = achievements['achievement4'];
data[4].type = achievements['achievement5'];

    const achievementsData = data.map((item) => (
        <div key={item.name}>
            <AchievementsCards type={item.type} name={item.name} title={item.title} image={item.id}/>        
        </div>
  ));
  
  return (
    <>
        <h2 className="mt-2 mb-0 text-4xl font-medium leading-tight text-slate-100">Your Achievements</h2>
        <SimpleGrid 
            cols={{ base: 3, sm: 3, lg: 5 }}
        >
            {achievementsData}
        </SimpleGrid>
    </>
  );
}

export default Achievement
