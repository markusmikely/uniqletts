import { useEffect, useState } from 'react'
import { Card, Stack, Text, Heading, Flex, Box, Button } from '@sanity/ui'
import { useClient } from 'sanity'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Stats {
  enquiryTypes: Record<string, number>
  enquiryStatuses: Record<string, number>
  topProperties: { title: string; viewCount: number; slug: string }[]
  newEnquiryCount: number
  totalViews: number
  pendingReviews: number
}

const STATS_QUERY = `{
  "enquiryTypes": {
    "valuation": count(*[_type == "enquiry" && type == "valuation"]),
    "viewing": count(*[_type == "enquiry" && type == "viewing"]),
    "contact": count(*[_type == "enquiry" && type == "contact"]),
    "maintenance": count(*[_type == "enquiry" && type == "maintenance"]),
    "general": count(*[_type == "enquiry" && type == "general"])
  },
  "enquiryStatuses": {
    "new": count(*[_type == "enquiry" && status == "new"]),
    "contacted": count(*[_type == "enquiry" && status == "contacted"]),
    "converted": count(*[_type == "enquiry" && status == "converted"]),
    "closed": count(*[_type == "enquiry" && status == "closed"])
  },
  "topProperties": *[_type == "property"] | order(viewCount desc)[0...5] {
    title, viewCount, "slug": slug.current
  },
  "newEnquiryCount": count(*[_type == "enquiry" && status == "new"]),
  "totalViews": math::sum(*[_type == "property"].viewCount),
  "pendingReviews": count(*[_type == "review" && status == "pending"])
}`

export function Dashboard() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.fetch<Stats>(STATS_QUERY).then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [client])

  if (loading) {
    return (
      <Card padding={4}>
        <Text>Loading dashboard…</Text>
      </Card>
    )
  }

  if (!stats) return null

  const typeChartData = Object.entries(stats.enquiryTypes).map(([type, count]) => ({
    name: type,
    count,
  }))

  const statusChartData = Object.entries(stats.enquiryStatuses).map(([status, count]) => ({
    name: status,
    count,
  }))

  const gtmId = import.meta.env.VITE_GTM_ID

  return (
    <Box padding={4}>
      <Stack space={5}>
        <Heading as="h1" size={3}>Analytics Dashboard</Heading>

        <Flex gap={3} wrap="wrap">
          <Card padding={4} radius={2} shadow={1} style={{ minWidth: 160 }}>
            <Text size={1} muted>New enquiries</Text>
            <Heading size={4}>{stats.newEnquiryCount}</Heading>
          </Card>
          <Card padding={4} radius={2} shadow={1} style={{ minWidth: 160 }}>
            <Text size={1} muted>Total property views</Text>
            <Heading size={4}>{stats.totalViews ?? 0}</Heading>
          </Card>
          <Card padding={4} radius={2} shadow={1} style={{ minWidth: 160 }}>
            <Text size={1} muted>Pending reviews</Text>
            <Heading size={4}>{stats.pendingReviews}</Heading>
          </Card>
        </Flex>

        <Flex gap={4} wrap="wrap">
          <Card padding={4} radius={2} shadow={1} style={{ flex: 1, minWidth: 300 }}>
            <Text weight="semibold" size={2} style={{ marginBottom: 16 }}>Enquiries by type</Text>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#086fb8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card padding={4} radius={2} shadow={1} style={{ flex: 1, minWidth: 300 }}>
            <Text weight="semibold" size={2} style={{ marginBottom: 16 }}>Enquiries by status</Text>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#e8833a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Flex>

        <Card padding={4} radius={2} shadow={1}>
          <Text weight="semibold" size={2} style={{ marginBottom: 16 }}>Top properties by views</Text>
          <Stack space={3}>
            {stats.topProperties.length === 0 ? (
              <Text muted>No property views yet</Text>
            ) : (
              stats.topProperties.map(p => (
                <Flex key={p.slug} justify="space-between" align="center">
                  <Text>{p.title}</Text>
                  <Text weight="semibold">{p.viewCount ?? 0} views</Text>
                </Flex>
              ))
            )}
          </Stack>
        </Card>

        <Card padding={4} radius={2} shadow={1}>
          <Text weight="semibold" size={2} style={{ marginBottom: 8 }}>Website traffic (GA4)</Text>
          <Text muted size={1} style={{ marginBottom: 16 }}>
            General website analytics are tracked via Google Analytics. Property views and enquiry pipeline stats above are tracked in Sanity.
          </Text>
          {gtmId ? (
            <Button
              as="a"
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              text="Open Google Analytics"
              tone="primary"
            />
          ) : (
            <Text muted size={1}>Set VITE_GTM_ID to enable GA4 tracking on the public site.</Text>
          )}
        </Card>
      </Stack>
    </Box>
  )
}
