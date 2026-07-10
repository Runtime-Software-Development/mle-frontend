# Mountain Legacy Explorer: Creating a Project Boundary for Map Navigator

This guide documents the exact workflow shown in the timestamped screenshots in this folder.

Goal:
Create a Project, create a Map Feature Group boundary, import KMZ boundary data,
extract map features, link the feature to the Project, and verify the boundary
displays on the Map navigator.

## What Was Used

- App: Mountain Legacy Explorer (Editor/Admin-enabled UI)
- Data file type: KMZ
- Metadata type for upload: Geographic Map Data
- Example project in screenshots: Stoney Nakoday Ecological Corridors
- Example boundary/feature label: Stoney Ecological Corridors Project Boundary

## End-to-End Steps

1. Create a new Project.
- Click `+ New` from the top toolbar.
- Choose `Add New Project`.
- Enter project name and description.
- Click `Add`.
- Confirm success message.

2. Open the new Project details page.
- Verify Project Details appear in the right panel.
- Keep this Project selected for the next step.

3. Create a Map Feature Group (map object container).
- From the Project page, click the inline `+` action.
- Choose `Add New Map Boundary/Feature`.
- Fill:
  - Name
  - Map Object Type = `Boundaries`
  - Description
- Click `Add` and confirm success.

4. Open the Map Feature Group record.
- In the left tree, expand `Map Feature Groups`.
- Select your newly created group.
- Confirm details show `Map Object Type` (or `Map Feature Type`) as `Boundaries`.

5. Upload KMZ metadata file to the Map Feature Group.
- On the Map Feature Group page, click inline `+`.
- Choose `Add Metadata File`.
- Import the `.kmz` file.
- Set `Metadata Type` to `Geographic Map Data`.
- Click `Add` and confirm upload completion.

6. Extract map features from the uploaded KMZ.
- Click the extraction action: `Extract map features from KMZ file`.
- In `Extract Map Features from File` dialog:
  - Select the KMZ metadata file.
  - Click `Extract Map Features`.
  - Select the generated feature row(s).
  - Click `Extract`.
- Confirm success message (example shown: feature generated and added).

7. Validate extracted feature details.
- Open the created Map Boundary/Feature item.
- Confirm fields are populated:
  - Name
  - Map Feature Type
  - Description
  - Geometry (GeoJSON)

8. Link the extracted boundary feature to the Project.
- Navigate back to the target Project page.
- Open `Add New Map Boundary/Feature`.
- In `Select a linked Map Feature`, choose the extracted feature.
- Optional: use `Filter By Keyword` (example used `Stoney`) and/or feature group filters.
- Click `Add`.

9. Verify in Project Map view.
- In Project details, check `Map Boundaries and Features`.
- Click `View on Map`.
- Confirm:
  - Boundary polygon is visible.
  - Related stations list appears under `Stations within Map Boundary`.

10. Verify in Map navigator controls.
- Switch to Map view (left panel `Map`).
- Ensure map overlays are enabled (e.g., `Boundaries`, optionally `Stations` and `Cluster`).
- Confirm the project boundary displays in the map viewport.

## Screenshot-to-Step Mapping (Timestamp Order)

- 7:55:55 PM: Create New Project dialog filled.
- 7:56:10 PM: Project created and visible.
- 8:06:33 PM: Project inline `+` menu with `Add New Map Boundary/Feature`.
- 8:16:43 PM: Add New Map Feature Group dialog (name/type/description).
- 8:18:48 PM: Success message for map object creation.
- 8:18:58 PM: Map Feature Group details page.
- 8:21:22 PM: Add Metadata File dialog with KMZ + `Geographic Map Data`.
- 8:22:04 PM: Upload completed status.
- 8:23:06 PM and 8:23:29 PM: Extract Map Features dialog, selected row, extract confirmation.
- 8:33:48 PM: Extracted feature details including Geometry (GeoJSON).
- 8:38:15 PM and 8:44:03 PM: Project-side linking form selecting linked map feature.
- 8:43:49 PM and 9:04:34 PM: Final map verification showing boundary polygon and stations.

## Visual Walkthrough (Embedded Screenshots)

The screenshots below are renamed in instruction order as `step-01.png` through `step-23.png`.

1. Create project dialog  
![Step 01](step-01.png)

2. Project created and visible  
![Step 02](step-02.png)

3. Open project inline add menu  
![Step 03](step-03.png)

4. Select add boundary/feature path  
![Step 04](step-04.png)

5. Fill new map feature group form  
![Step 05](step-05.png)

6. Submit new map feature group  
![Step 06](step-06.png)

7. Confirm map object created  
![Step 07](step-07.png)

8. View map feature group details  
![Step 08](step-08.png)

9. Open add metadata action  
![Step 09](step-09.png)

10. Upload KMZ as metadata file  
![Step 10](step-10.png)

11. Metadata upload form state  
![Step 11](step-11.png)

12. KMZ upload complete status  
![Step 12](step-12.png)

13. Open extract-map-features flow  
![Step 13](step-13.png)

14. Extract dialog ready  
![Step 14](step-14.png)

15. Select generated feature row  
![Step 15](step-15.png)

16. Extracted row highlighted  
![Step 16](step-16.png)

17. Extraction confirmation state  
![Step 17](step-17.png)

18. Open newly generated feature  
![Step 18](step-18.png)

19. Validate feature geometry/details  
![Step 19](step-19.png)

20. Link extracted feature to project  
![Step 20](step-20.png)

21. Verify boundary on map view  
![Step 21](step-21.png)

22. Filter/select linked feature in project form  
![Step 22](step-22.png)

23. Final map navigator verification  
![Step 23](step-23.png)

## Notes and Caveats

- UI labels differ slightly across pages (`Map Object Type` vs `Map Feature Type`) but represent the same boundary classification context in this workflow.
- The screenshots show one-feature extraction from one KMZ; multi-feature KMZ files should follow the same process with multiple selected rows.
- The screenshot sequence confirms successful display for multiple projects (Stoney and Waterton examples), indicating the process is reusable.

## Quick Troubleshooting

- Boundary not visible on map:
  - Ensure `Boundaries` toggle is enabled on Map controls.
  - Confirm the feature has Geometry (GeoJSON) populated.
  - Reopen extraction dialog and confirm feature row extraction completed.

- Feature missing in link dropdown:
  - Use keyword filter.
  - Confirm extracted feature exists under `Map Feature Groups`.
  - Confirm extraction was completed after KMZ upload.

- No stations listed under map boundary:
  - Boundary geometry may not overlap station coordinates.
  - Verify coordinate system and geometry validity in source KMZ.
