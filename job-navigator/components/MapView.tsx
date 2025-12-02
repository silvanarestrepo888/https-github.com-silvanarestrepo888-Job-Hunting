'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface HierarchyNode {
  name: string
  title: string
  level: number
  department: string
  children?: HierarchyNode[]
}

interface MapViewProps {
  lead: {
    name: string
    title?: string
    hierarchy?: string
  }
  companyLeads: any[]
}

export default function MapView({ lead, companyLeads }: MapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !lead.hierarchy) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600
    const margin = { top: 20, right: 120, bottom: 20, left: 120 }

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // Create hierarchy data
    const hierarchyData = createHierarchyData(lead, companyLeads)

    const root = d3.hierarchy(hierarchyData)
    const treeLayout = d3.tree<HierarchyNode>()
      .size([2 * Math.PI, Math.min(width, height) / 2 - 100])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

    treeLayout(root as any)

    // Links
    const link = g.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkRadial<any, any>()
        .angle(d => d.x)
        .radius(d => d.y))
      .style('fill', 'none')
      .style('stroke', '#ccc')
      .style('stroke-width', 2)

    // Nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `
        rotate(${(d.x * 180 / Math.PI - 90)})
        translate(${d.y},0)
      `)

    // Node circles
    node.append('circle')
      .attr('r', 8)
      .style('fill', (d: any) => {
        if (d.data.name === lead.name) return '#3B82F6'
        return levelToColor(d.data.level)
      })
      .style('stroke', '#fff')
      .style('stroke-width', 2)

    // Node labels
    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: any) => d.x < Math.PI === !d.children ? 12 : -12)
      .attr('text-anchor', (d: any) => d.x < Math.PI === !d.children ? 'start' : 'end')
      .attr('transform', (d: any) => d.x >= Math.PI ? 'rotate(180)' : null)
      .text((d: any) => d.data.name)
      .style('font-size', '12px')
      .style('fill', '#374151')

    // Title on hover
    node.append('title')
      .text((d: any) => `${d.data.name}\n${d.data.title}\n${d.data.department}`)

  }, [lead, companyLeads])

  const createHierarchyData = (currentLead: any, allLeads: any[]): HierarchyNode => {
    const levels = ['C-Level', 'VP', 'Director', 'Manager', 'Individual Contributor']
    
    // Group leads by department and level
    const departments: { [key: string]: any[] } = {}
    allLeads.forEach(l => {
      const dept = l.department || 'Other'
      if (!departments[dept]) departments[dept] = []
      departments[dept].push(l)
    })

    // Create root node (company)
    const root: HierarchyNode = {
      name: currentLead.company,
      title: 'Company',
      level: 0,
      department: 'Company',
      children: []
    }

    // Add department nodes
    Object.entries(departments).forEach(([dept, leads]) => {
      const deptNode: HierarchyNode = {
        name: dept,
        title: 'Department',
        level: 1,
        department: dept,
        children: []
      }

      // Add leads as children
      leads.forEach(l => {
        deptNode.children?.push({
          name: `${l.firstName} ${l.lastName}`,
          title: l.title || 'Unknown',
          level: levels.indexOf(l.seniorityLevel || 'Individual Contributor') + 2,
          department: l.department || 'Other'
        })
      })

      root.children?.push(deptNode)
    })

    return root
  }

  const levelToColor = (level: number) => {
    const colors = ['#9333EA', '#7C3AED', '#6366F1', '#3B82F6', '#06B6D4', '#10B981']
    return colors[Math.min(level, colors.length - 1)]
  }

  if (!lead.hierarchy) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hierarchy data available. Enrich the lead first.</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">Organization Hierarchy</h3>
      <div className="overflow-auto">
        <svg ref={svgRef} className="w-full h-full min-h-[600px]"></svg>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Current Lead</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span>C-Level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
          <span>VP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
          <span>Director</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Manager</span>
        </div>
      </div>
    </div>
  )
}