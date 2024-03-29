import React from 'react';
import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Text, Paper, Group, PaperProps, Button, Divider, Anchor, Stack, SimpleGrid, Card,} from '@mantine/core';
import axios from 'axios';
import LoginWithIntra from './LoginWithIntra';
import image from './assite/ping-pong.jpg'

// function Authentication(props: PaperProps) {

//     return (
//         <>
//         <div className="h-[2vh]"></div>
//         <div className='mx-[50px] mt-5 p-5 rounded-xl bg-slate-900 shadow-5'>
//             <SimpleGrid
//                 className='grid place-items-center'
//                 cols={{base: 1, md:2, lg: 2, xl: 2}}
//                 spacing='sm'
//             >
//                 <Card
//                     radius='lg'
//                     style={{backgroundColor: 'rgb(31 41 55)'}}
//                 >
//                     <Text c='white' size="md" fw={500}>
//                         Welcome to game
//                     </Text>
//                     <Group grow mb="md" mt="md">
//                         <LoginWithIntra/>
//                     </Group>
//                 </Card>
//                 <img className='rounded-lg h-[80vh]' src={image} alt="ping pong image" />
//             </SimpleGrid>
//         </div>
//         </>
//     );
// }

function Authentication(props: PaperProps) {
    const [incorect, setIncorect] = React.useState(false);
    const [type, toggle] = useToggle(['login', 'register']);

    const form = useForm({
        initialValues: {
        email: '',
        name: '',
        password: '',
        terms: true,
        },
        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const handelSubmit = async () => {
        type === 'login' ? await axios.post('login/pass', {
        email: form.values.email,
        password: form.values.password,
        })
        .then((res) => {
            if (res.status === 201) {
                console.log("res: ", res);
                if(res.data.twofa === true)
                    window.location.href = '/auth';
                else
                    window.location.href = '';
            }

        })
        .catch((err) => {
            setIncorect(true);
            console.error("err in loging in: ", err);
        }):
    await axios.post('signup/pass', {
        name: form.values.name,
        email: form.values.email,
        password: form.values.password,
        })
        .then((res) => {
            if (res.status === 201) {
                console.log("res: ", res);
                window.location.href = '/Setting';
            }
        })
        .catch((err) => {
            setIncorect(true);
            console.error("err in sining up: ", err);
        })
    };

    return (
        <div>
        <div className='sticky top-0 z-50 p-2'></div>
        <div className='mx-[50px] mt-5 p-5 rounded-xl bg-slate-900 shadow-5'>
            <SimpleGrid
                className='grid place-items-center'
                cols={{base: 1, md:2, lg: 2, xl: 2}}
                spacing='sm'
            >
                <Paper h={520} c='blue' bg={'rgb(31 41 55)'} radius="lg" p="md" {...props}>
                <Text size="md" fw={500}>
                    Welcome to game
                </Text>
                <Group grow mb="md" mt="md">
                    <LoginWithIntra/>
                </Group>
                <Divider label="Or continue with email" labelPosition="center" my="lg" />
                        {incorect && <Text c={'red'}>Incorrect, try agin</Text>}
                <form onSubmit={form.onSubmit(() => {handelSubmit})}>
                    <Stack>
                        {type === 'register' && (
                        <TextInput
                            radius="md"
                            variant="filled"
                            required
                            label="Name"
                            placeholder="Your name"
                            value={form.values.name}
                            onChange={(event) => {
                                    form.setFieldValue('name', event.currentTarget.value);
                                    setIncorect(false)
                                }
                            }
                        />
                        )}
                        <TextInput
                            radius="md"
                            variant="filled"
                            required
                            label="Email"
                            placeholder="Your email"
                            value={form.values.email}
                            error={form.errors.email && 'Invalid email'}
                            onChange={(event) => {
                                form.setFieldValue('email', event.currentTarget.value);
                                    setIncorect(false);
                                }
                            }
                            />
                            <PasswordInput
                                radius="md"
                                variant="filled"
                                required
                                label="Password"
                                placeholder="Your password"
                                value={form.values.password}
                                error={form.errors.password && 'Password should include at least 6 characters'}
                                onChange={(event) =>  {
                                        form.setFieldValue('password', event.currentTarget.value);
                                        setIncorect(false);
                                    }
                                }
                            />
                        </Stack>
                        <Group justify="space-between" mt="md">
                            <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
                                {type === 'register'
                                ? 'Already have an account? Login'
                                : "Don't have an account? Register"}
                            </Anchor>
                            <div>
                                <Button onClick={handelSubmit} color='green' size='xs' type="submit" radius="xl">
                                    {upperFirst(type)}
                                </Button>
                            </div>
                        </Group>
                    </form>
                </Paper>
                <img className='rounded-lg' src="https://cdn.dribbble.com/users/159078/screenshots/3020263/output_mrqqb3.gif" alt="ping pong image" />
            </SimpleGrid>
        </div>
    </div>
    );
}

export default Authentication;