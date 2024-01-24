import React, { useEffect, useState } from 'react'
import { Card, Avatar, Text, Group, Button, SimpleGrid } from '@mantine/core';
import axios from 'axios';
// import sectionimage from '../../../../4304494.jpg'
import sectionimage from './avatar-10.png'
import { Link } from 'react-router-dom';


const userInfo = {
    userName: 'rarahhal',
    avatar: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    email: 'rizqyrahhal8@gmail.com',
    level: '1',   // when wine 3 matches move from level to next level
    win: 5,
    losses: 3
}

interface UserCardInterface {
    name: string;
    avatar: string;
    level: number;
    win: number;
    loss: number;
}


function UserCard({setUrlName, avatar} : {setUrlName: Function, avatar: string }) {
    // const [userName, setUserName] = useState<string| undefined>();
    const [data, setData] = useState<UserCardInterface>();
    const stats = [
      {value: data?.win, label: 'Wins'},
      {value: (data?.win) + (data?.loss), label: 'Played game'},
      {value: data?.loss, label: 'losses'},
    ];
    useEffect(() => {
        const getUserNmae = async () => {
            await axios.get("user/name")
            .then((res) => {
                console.log(res.data.name);
                // setUserName(res.data.name);
                setData(res.data);
            })
            .catch((err) => {
              console.log("Error in geting data in edit profile :", err);
            })
          };
          getUserNmae();
      }, []);

  const items = stats.map((stat) => (
    <div key={stat.label} className={stat.label !== 'Played game' ? "mb-12" : ""}>
      <Text ta="center" fz="lg" fw={500} c={(stat.label === 'Played game'? "dimmed" : stat.label === 'Wins' ? 'green': 'red')}>
        {stat.value}
      </Text>
      <Text ta="center" fz="sm" lh={1} c={(stat.label === 'Played game'? "dimmed" : stat.label === 'Wins' ? 'green': 'red')}>
        {stat.label}
      </Text>
    </div>
  ));

    const handleClick = () => {
        setUrlName(data?.name);
        // <Link to={'/'+ window.location.pathname.split("/")[1] +'/public/profile'}></Link>
        // window.location.href = '/'+userName+'/public/profile';
    }

  return (
    //  h-[515px]
    // <div className='p-2  w-[250px]  rounded-lg bg-gray-800'>
     <Card p={2} style={{backgroundColor: 'rgb(31 41 55)'}}    radius="lg">
      {/* <Card.Section
        h={250}
        style={{
          backgroundImage: `url(${avatar})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
        /> */}
      <Avatar
        src={avatar}
        size={250}
        radius={250}
        m="auto"
        mt={12}
        />
      <Text  ta="center" fz='xl' fw={800} mt="md" mb='md' c='dimmed'>

        {data?.name}
      </Text>
      <Text ta="center" c="indigo" fz="sm">
      {"level "  + data?.level}
      </Text>
      <Group mt="md" justify="center" gap={30}>
        {items}
      </Group>
      {/* <div className='flex justify-center items-centerw-12 mt-5'>
        <Button radius="md" size="md" color='gray' onClick={handleClick}>
        <Link to={`/UserProfile?name=${userName}`}>
            show your public profile
        </Link>
        </Button>
      </div> */}
    </Card>
    //   </div>
  );
}

export default UserCard;