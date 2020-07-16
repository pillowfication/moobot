import React from 'react'
import useSWR from 'swr'
import unfetch from 'unfetch'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'

const fetcher = url => unfetch(url).then((res) => res.json())

const Index = () => {
  const { data, error } = useSWR('/api/stats', fetcher)

  if (error) {
    return <Typography>Error</Typography>
  }

  if (!data) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Rank</TableCell>
          <TableCell>User</TableCell>
          <TableCell>Moos</TableCell>
          <TableCell>Moos Triggered</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((datum, index) =>
          <TableRow key={index}>
            <TableCell>#{index + 1}</TableCell>
            <TableCell>{datum.meta.tag}</TableCell>
            <TableCell>{datum.moos}</TableCell>
            <TableCell>{datum.moosTriggered}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default Index
