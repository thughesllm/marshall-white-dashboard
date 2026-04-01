# Marshall White Dashboard — Test Plan

## 1. Navigation & Layout
- [ ] Homepage (/) redirects to /properties
- [ ] Nav bar shows "Marshall White" and "Stonnington Office"
- [ ] Geist font renders (not Times New Roman / serif)

## 2. All Properties Tab
- [ ] Table loads with properties (no lease/leased)
- [ ] 25 rows per page max
- [ ] Correct columns visible: Address, Status, Lead Agent, Days on Market, Campaign
- [ ] Office and Listed columns hidden on mobile, visible on desktop
- [ ] Search filters by address
- [ ] Search filters by agent name
- [ ] Search filters by suburb
- [ ] Status filter dropdown opens and shows: All, For Sale, Under Offer, Sold (no lease options)
- [ ] Status filter "Sold" shows only sold properties
- [ ] Agent filter dropdown opens and lists agents
- [ ] Agent filter selects an agent and table updates
- [ ] Agent filter "All Agents" resets
- [ ] Combining status + agent filter works
- [ ] Column sorting: click Address sorts alphabetically
- [ ] Column sorting: click Days on Market sorts numerically
- [ ] Pagination: Previous/Next buttons work
- [ ] Pagination: page count updates when filtering
- [ ] Row click navigates to detail page
- [ ] Row hover shows pointer cursor and highlight
- [ ] Order Campaign button in table shows toast
- [ ] Order Campaign button click doesn't navigate (stopPropagation)
- [ ] Status badges show correct colours (blue For Sale, amber Under Offer, green Sold)
- [ ] Days on Market colour coding: green <30, amber 30-60, red >60

## 3. Rescue Tab
- [ ] Tab shows count of rescue properties
- [ ] No sold properties in rescue tab
- [ ] Rescue Reason column shows badges
- [ ] Search works in rescue tab
- [ ] Row click navigates to detail page
- [ ] Order Campaign button shows toast

## 4. Just Listed Tab
- [ ] Tab shows count
- [ ] Only shows properties listed in last 14 days
- [ ] All are sale/now-selling status
- [ ] Row click navigates to detail

## 5. Just Sold Tab
- [ ] Tab shows count
- [ ] Only shows sold properties
- [ ] Sorted by sold date descending
- [ ] Row click navigates to detail

## 6. Property Detail Page — Campaign Decision View
- [ ] Back to Properties link visible and navigates back
- [ ] Address displayed as heading
- [ ] Identifier bar shows: office, beds, baths, cars, type, price, listed date
- [ ] Order Campaign button visible on ALL property types (sale, sold, etc.)
- [ ] Order Campaign button shows toast when clicked
- [ ] Key metrics grid: Status badge, Days on Market (colour coded), Campaign status
- [ ] Rescue alert card visible on rescue properties (red border, rescue badges)
- [ ] No rescue alert on non-rescue properties
- [ ] Upcoming events card shown when inspections/auctions exist
- [ ] Agent cards show photo (not just icon), name, position, phone, email
- [ ] Agent 3 shows full details (not just name)
- [ ] Sold details card shows on sold properties (sold date, price, method)
- [ ] Listing Details section collapsed by default
- [ ] Listing Details expands on click
- [ ] Expanded: images, description, features, floorplans visible
- [ ] Floorplans constrained width (not full-width)
- [ ] Description text doesn't overflow
- [ ] External link to marshallwhite.com.au present (no REA/Domain)
- [ ] External link URL doesn't contain \1

## 7. Responsive
- [ ] Mobile (375px): dashboard table readable, columns hidden appropriately
- [ ] Mobile (375px): detail page stacks correctly
- [ ] Mobile (375px): tabs are scrollable/accessible

## 8. Cross-tab Navigation
- [ ] Switch between all 4 tabs without errors
- [ ] Navigate to detail from each tab, back button returns to list
