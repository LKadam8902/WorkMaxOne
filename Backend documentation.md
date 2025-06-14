Backend documentation

API :
[<u>http://localhost:8000/admin/login</u>](http://localhost:8000/admin/login)
(done)

Admin Login body

{

> “useremail”
> :[”<u>admin@workmaxone.com</u>](mailto:admin@workmaxone.com)”,
> “password”:12345678

}

Token :
eyJhbGciOiJSUzUxMiJ9.eyJzdWIiOiIxIiwibmFtZSI6ImFkbWluQHdvcmttYXhvbmUuY29tIiwicm9
sZSI6IkFETUlOIiwiZXhwIjoxNzQ5NjQ0MTkyfQ.qDtMlFW5-PUzN_HZYwgC_7ezJniZh\_\_aM1gF
19p0ILIdVHIk9kYykP3ZIPw0o-KwiiqH46eN7QMyBdoVS00T_Sv-rpx8In8qDNS2N1iVAT9ZJMCS
2DMbSSzhj5aEczhFqK5AaI-M6VqEa8_e7F96BiK1QVfxd_xIo42kLZ2i0Fwo3Gvmc3msnGkZGo
MFZO-ftnqELhGa5R0q-BpC5zkwGL7GDjIRXDgBMWEW5m0L8CnhH_bh4Ms3cunQQ6Imrz3s
Q7tL9m2ezU-wasaomWB7XuSdMuAVyx7YF5hAmrUpLh7kj9NMQbNybZy1GwudnFXXEK1hjkc
gzXNwP6j_nsybsoF47wzsk4O70PokeFlSzfSGyxlmVls2nx58oBjP2umnGDSHG_rb8M4GMSCp
1wyIBuVypi7RQu3VqmdxF6qMuDAhu7gqP4kxE7yx6qBulL094AiXD2hl8UA4fxbAqmCxtf2G0zV
n84pPVmxlGsGPs7apcotMjYsWYOP7ecZ2MZS_B3ErD2aMQePzJiHJZqlrX0pZguQMV_1JtWu
pGDnWvC_P5KroZT6rzxSzqwMTaW3nTBC5gE537FsUriPkVwp8a8QusVKiJLbxI1PCg5TLMww
9NST7iGuLzJB_BqubqGoaSGjL-48-wYRXsavbZm9LDeR-YeYg0C1p1-YRhP6psMA

API :
[<u>http://localhost:8000/admin/view</u>/<u>getApprovalYetUser</u>](http://localhost:8000/admin/view/getApprovalYetUser)<u>(</u>done)

API:
<u>[http://localhost:8000/admin/view/](http://localhost:8000/admin/view/getApprovalYetUser)A</u>pproveEmployee/{email}
(done)

API<u>[:http://localhost:8000/](http://localhost:8000/admin/view/getApprovalYetUser)e</u>mployee/create

Employee create body {

> “employeeName” :”Niraj”,
> “email”:<u>[”niraj12@workmaxone.com](mailto:niraj12@workmaxone.com)”</u>,
>
> “password”:12345678, “isTeamLead”:true

}

API:
<u>[http://localhost:8000/a](http://localhost:8000/admin/view/getApprovalYetUser)u</u>th/teamLead/login

Team lead login {

> “useremail”:[”<u>niraj12@workmaxone.com</u>](mailto:niraj12@workmaxone.com)”,
> “password”:12345678

}

Token:
eyJhbGciOiJSUzUxMiJ9.eyJzdWIiOiIxIiwibmFtZSI6Ik5pcmFqIiwicm9sZSI6IlRFQU1fTEVBRC
IsImV4cCI6MTc0OTY0NDcwM30.njR2CD\_-QDn3hbpc4UcDEeC4GDsILe7L-BXDe0h0nb68JPQEowG3B
CPru9gIRDDNa6f41hPJw5GNt2TesbQxlWsJMNE4GuZl5uEP5c3JZxM92bVZCXc_akPi6GoekDqzwyHF
WtVx_514ytAUnZ6LU18coYkqB0qCD9rsNTjzNp-TEr2BYIDmHuXtHtGUA70AnnOKbaB70CUj5Vj-Tl1
qeYZlXXFTMhdXj3VHoFTqDfGQcISVNmxCYn202VNk-aTkm50E9TseV2Rk71nG9bhiGi_ay4QIHIP2px
i-Xk3aGbJ-bqbEo3cg3mlRbkFZC3t0_Ly1HTbMPbb7sRRaoz2DC1wVKGuX0-gesfEAg_IcZp8hrOXU2
HEsNuVMreyxH_4Z4tGlF7NSESsLVktnRoEolsmvQZtMD1ZGRrHOYHYKTY2cbkzvGkKvl-Y3F226BmtU
YGwyMAZlUWaR5YAAI0fKCQXytpTiXSOS0-Ut0voBUlwUeK2h64-175keqa-WgCGOUrisvvTxjkn3loC
rlCALhxTgk6jzsuGv_E5xptjFet7ZvumaRBOJH027xoAV-JtjcpmIXqWe6wihP_TGVlU8qYf6HgQJXN
MK1ZYgwV6zruL3QQvd5ucLac2NDNLE-IMm6qNR3gOUW7gE2cTaMzZ1AnjQE7lUeFyBnHTcp4aFZHk

API:
[<u>http://localhost:8000/teamLead/createProject</u>](http://localhost:8000/teamLead/createProject)

Project body

{

"name":"G drive" }

API :
[<u>http://localhost:8000/teamLead/createTask</u>](http://localhost:8000/teamLead/createTask)

Task Body

{

> "name":"G Drive", "skillSet":\["Springboot","AngularJs","Docker"

\] }

API:
<u>[http://localhost:8000/](http://localhost:8000/teamLead/createProject)a</u>uth/benchedEmployee/login

Login body {

> "useremail" :"Rahu12@workmaxone.com", "password":12345678

}

Token:

API :
[<u>http://localhost:8000/</u>](http://localhost:8000/teamLead/createProject)benchEmployee/addSkills

Skills Request

{ SkillSet:\[“Springboot”,”AngluarJS”\] }

API[<u>:http://localhost:8000/teamLead/assignTask/{taskId</u>](http://localhost:8000/teamLead/assignTask/%7BtaskId)}
(token required)

API: http://localhost:8000/benchEmployee/updateTask/1
