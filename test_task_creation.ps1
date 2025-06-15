# PowerShell script to test task creation functionality

# Start the backend
Write-Host "Starting the backend application..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-Command", "cd 'c:\Users\adity\Desktop\capstone\WorkMaxOne\backend\workmaxone\workmaxone'; .\gradlew bootRun" -NoNewWindow

# Wait for the application to start
Write-Host "Waiting for application to start..."
Start-Sleep -Seconds 30

# Test the admin login
Write-Host "Testing admin login..."
$adminLoginBody = @{
    useremail = "admin@workmaxone.com"
    password = "12345678"
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "http://localhost:8000/admin/login" -Method POST -Body $adminLoginBody -ContentType "application/json"
    Write-Host "Admin login successful"
    $adminToken = $adminLoginResponse.token
} catch {
    Write-Host "Admin login failed: $($_.Exception.Message)"
    exit 1
}

# Create an employee (team lead)
Write-Host "Creating team lead employee..."
$createEmployeeBody = @{
    employeeName = "TestTeamLead"
    email = "testteamlead@workmaxone.com"
    password = "12345678"
    isTeamLead = $true
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    $createEmployeeResponse = Invoke-RestMethod -Uri "http://localhost:8000/employee/create" -Method POST -Body $createEmployeeBody -Headers $headers
    Write-Host "Team lead created successfully"
} catch {
    Write-Host "Failed to create team lead: $($_.Exception.Message)"
}

# Approve the employee
Write-Host "Approving the team lead..."
try {
    $approveResponse = Invoke-RestMethod -Uri "http://localhost:8000/admin/view/ApproveEmployee/testteamlead@workmaxone.com" -Method PUT -Headers $headers
    Write-Host "Team lead approved successfully"
} catch {
    Write-Host "Failed to approve team lead: $($_.Exception.Message)"
}

# Login as team lead
Write-Host "Logging in as team lead..."
$teamLeadLoginBody = @{
    useremail = "testteamlead@workmaxone.com"
    password = "12345678"
} | ConvertTo-Json

try {
    $teamLeadLoginResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/teamLead/login" -Method POST -Body $teamLeadLoginBody -ContentType "application/json"
    Write-Host "Team lead login successful"
    $teamLeadToken = $teamLeadLoginResponse.token
} catch {
    Write-Host "Team lead login failed: $($_.Exception.Message)"
    exit 1
}

# Create a project
Write-Host "Creating a project..."
$createProjectBody = @{
    name = "Test Project"
} | ConvertTo-Json

try {
    $projectHeaders = @{
        Authorization = "Bearer $teamLeadToken"
        "Content-Type" = "application/json"
    }
    $createProjectResponse = Invoke-RestMethod -Uri "http://localhost:8000/teamLead/createProject" -Method POST -Body $createProjectBody -Headers $projectHeaders
    Write-Host "Project created successfully"
} catch {
    Write-Host "Failed to create project: $($_.Exception.Message)"
}

# Create a task
Write-Host "Creating a task..."
$createTaskBody = @{
    name = "Test Task"
    skillSet = @("Java", "Spring Boot", "Angular")
} | ConvertTo-Json

try {
    $createTaskResponse = Invoke-RestMethod -Uri "http://localhost:8000/teamLead/createTask" -Method POST -Body $createTaskBody -Headers $projectHeaders
    Write-Host "Task created successfully!"
    Write-Host "Response: $createTaskResponse"
} catch {
    Write-Host "Failed to create task: $($_.Exception.Message)"
    Write-Host "Error details: $($_.ErrorDetails.Message)"
}

Write-Host "Test completed. Check the output above for results."
