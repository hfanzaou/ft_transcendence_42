import React from 'react';
import { Text, Card } from '@mantine/core';
import leaderboardInterface from './Leaderboard';

function LeaderbordCard({data, rank}: {data: leaderboardInterface, rank: number}) {

    return (
        <Card p={0} radius="md" bg='dark' className='flex flex-col space-y-4 h-full w-full'>
          <Card.Section className='h-[35vh]'>
            <img
                className="object-cover w-full h-full"
                src={data?.avatar}
                height={100}
                alt={data?.name}
            />
          </Card.Section>
          <div className='flex flex-col items-center space-y-2 m-2'>
            <Text ta="center" fz="md" fw={800} c='blue' mt="md">
                {data?.name}
            </Text>
            <Text ta="center" fz="md" fw={800} c='cyan' mt="md">
                #{rank}
            </Text>
            <Text c='indigo' ta='center' variant="default" mt="md">
                Level {data?.level}
            </Text>
          </div>
        </Card>
  );
}

export default LeaderbordCard;