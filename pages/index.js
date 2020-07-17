import React from 'react'
import useSWR from 'swr'
import unfetch from 'unfetch'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import TableContainer from '@material-ui/core/TableContainer'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'

const fetcher = url => unfetch(url).then((res) => res.json())

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(5),
    whiteSpace: 'nowrap'
  },
  headerUser: {
    paddingLeft: 'calc(16px + 48px + 1em)'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    verticalAlign: 'middle',
    marginRight: '1em'
  },
  discriminator: {
    color: '#9a9a9a'
  }
}))

const Index = () => {
  const { data, error } = useSWR('/api/stats', fetcher)
  const classes = useStyles()

  if (error) {
    return <Typography>Error</Typography>
  }

  if (!data) {
    return <Typography>Loading...</Typography>
  }

  return (
    <TableContainer component={Paper} className={classes.container}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center'>Rank</TableCell>
            <TableCell className={classes.headerUser}>User</TableCell>
            <TableCell align='center'>Moos</TableCell>
            <TableCell align='center'>Moos Triggered</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((datum, index) =>
            <TableRow key={index}>
              <TableCell align='center'>
                #{index + 1}
              </TableCell>
              <TableCell>
                <img src={`https://cdn.discordapp.com/avatars/${datum.meta.id}/${datum.meta.avatar}.png?size=128`} className={classes.avatar} />
                {datum.meta.username}
                <span className={classes.discriminator}>#{datum.meta.discriminator}</span>
              </TableCell>
              <TableCell align='center'>{datum.moos}</TableCell>
              <TableCell align='center'>{datum.moosTriggered}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default Index
